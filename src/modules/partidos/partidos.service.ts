import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePartidoDto } from './dto/create-partido.dto.js';
import { UpdatePartidoDto } from './dto/update-partido.dto.js';
import { JornadasService } from '../jornadas/jornadas.service.js';
import { EquiposService } from '../equipos/equipos.service.js';
import { SedesService } from '../sedes/sedes.service.js';
import { JugadoresService } from '../jugadores/jugadores.service.js';
import {
  UserJwt,
  esDeEquipo,
  verificarArbitro,
} from '../auth/permisos.helper.js';
import { Rol } from '../auth/roles.enum.js';
import { Alineacion } from '../alineaciones/entities/alineacion.entity.js';
import { LiguillaService } from '../liguilla/liguilla.service.js';
import {
  PartidosGatewayService,
  type FiltroPartidosRemoto,
  type PartidoRemoto,
} from './partidos.gateway.js';

export const MIN_JUGADORES_POR_EQUIPO = 9;
export const MIN_TITULARES_ALINEACION = 9;

const CAMPOS_ARBITRO = [
  'golesLocal',
  'golesVisitante',
  'estado',
  'penalesLocal',
  'penalesVisitante',
];

@Injectable()
export class PartidosService {
  constructor(
    private readonly partidosGateway: PartidosGatewayService,
    private readonly jornadasService: JornadasService,
    private readonly equiposService: EquiposService,
    private readonly sedesService: SedesService,
    private readonly jugadoresService: JugadoresService,
    @InjectRepository(Alineacion)
    private readonly alineacionRepository: Repository<Alineacion>,
    private readonly liguillaService: LiguillaService,
  ) {}

  /** Traduce el rol del usuario al filtro soportado por el microservicio */
  private buildFiltro(
    user?: UserJwt,
    extra: FiltroPartidosRemoto = {},
  ): FiltroPartidosRemoto {
    if (user?.rol === Rol.ARBITRO) {
      return { ...extra, arbitroId: user.id };
    }
    if (user && esDeEquipo(user)) {
      return { ...extra, equipoId: user.equipoId ?? -1 };
    }
    return extra;
  }

  /** Hidrata en bloque jornada, equipoLocal, equipoVisitante y sede sin N+1 queries */
  private async hidratar(lista: PartidoRemoto[]): Promise<any[]> {
    if (lista.length === 0) return [];

    const [jornadas, equipos, sedes] = await Promise.all([
      this.jornadasService.findAll(),
      this.equiposService.findAll(),
      this.sedesService.findAll(),
    ]);

    const jornadasMap = new Map(jornadas.map((j) => [j.id, j]));
    const equiposMap = new Map(equipos.map((e) => [e.id, e]));
    const sedesMap = new Map(sedes.map((s) => [s.id, s]));

    return lista.map((p) => ({
      ...p,
      jornada: jornadasMap.get(p.jornadaId) ?? null,
      equipoLocal: equiposMap.get(p.equipoLocalId) ?? null,
      equipoVisitante: equiposMap.get(p.equipoVisitanteId) ?? null,
      sede: p.sedeId ? (sedesMap.get(p.sedeId) ?? null) : null,
    }));
  }

  private async validarAlineacionesDefinidas(
    partidoId: number,
    equipoIds: number[],
  ): Promise<void> {
    for (const equipoId of equipoIds) {
      const titulares = await this.alineacionRepository.count({
        where: { partidoId, equipoId, titular: true },
      });

      if (titulares < MIN_TITULARES_ALINEACION) {
        const equipo = await this.equiposService.findOne(equipoId);
        throw new BadRequestException(
          titulares === 0
            ? `El equipo "${equipo.nombre}" no tiene alineación definida para este partido`
            : `El equipo "${equipo.nombre}" solo tiene ${titulares} titular(es) en su alineación (mínimo ${MIN_TITULARES_ALINEACION})`,
        );
      }
    }
  }

  private async validarJugadoresMinimos(equipoIds: number[]): Promise<void> {
    for (const equipoId of equipoIds) {
      const total = await this.jugadoresService.countByEquipo(equipoId);
      if (total < MIN_JUGADORES_POR_EQUIPO) {
        const equipo = await this.equiposService.findOne(equipoId);
        throw new BadRequestException(
          `El equipo "${equipo.nombre}" tiene ${total} jugador(es) registrados y necesita mínimo ${MIN_JUGADORES_POR_EQUIPO} para jugar`,
        );
      }
    }
  }

  async create(dto: CreatePartidoDto) {
    if (dto.equipoLocalId === dto.equipoVisitanteId) {
      throw new BadRequestException(
        'El equipo local y el visitante no pueden ser el mismo',
      );
    }

    await this.jornadasService.findOne(dto.jornadaId);
    await this.equiposService.findOne(dto.equipoLocalId);
    await this.equiposService.findOne(dto.equipoVisitanteId);
    if (dto.sedeId) {
      await this.sedesService.findOne(dto.sedeId);
    }

    await this.validarJugadoresMinimos([
      dto.equipoLocalId,
      dto.equipoVisitanteId,
    ]);

    const creado = await this.partidosGateway.create(dto);
    const [hidratado] = await this.hidratar([creado]);
    return hidratado;
  }

  async findAll(user?: UserJwt) {
    const lista = await this.partidosGateway.findAll(this.buildFiltro(user));
    return this.hidratar(lista);
  }

  async findByJornada(jornadaId: number, user?: UserJwt) {
    const lista = await this.partidosGateway.findAll(
      this.buildFiltro(user, { jornadaId }),
    );
    return this.hidratar(lista);
  }

  async findOne(id: number, user?: UserJwt) {
    const partido = await this.partidosGateway.findOne(id);
    if (!partido) {
      throw new NotFoundException(`Partido con ID ${id} no encontrado`);
    }

    if (user?.rol === Rol.ARBITRO && partido.arbitroId !== user.id) {
      throw new ForbiddenException('Este partido no te corresponde');
    }
    if (
      user &&
      esDeEquipo(user) &&
      partido.equipoLocalId !== user.equipoId &&
      partido.equipoVisitanteId !== user.equipoId
    ) {
      throw new ForbiddenException('Este partido no es de tu equipo');
    }

    const [hidratado] = await this.hidratar([partido]);
    return hidratado;
  }

  async update(id: number, dto: UpdatePartidoDto, user?: UserJwt) {
    const partido = await this.findOne(id);
    if (Object.keys(dto).length === 0) return partido;

    if (user?.rol === Rol.ARBITRO) {
      verificarArbitro(user, partido.arbitroId ?? -1);
      const noPermitidos = Object.keys(dto).filter(
        (k) => !CAMPOS_ARBITRO.includes(k),
      );
      if (noPermitidos.length > 0) {
        throw new ForbiddenException(
          `El árbitro solo puede modificar: ${CAMPOS_ARBITRO.join(', ')}`,
        );
      }
    }

    const local = dto.equipoLocalId ?? partido.equipoLocalId;
    const visitante = dto.equipoVisitanteId ?? partido.equipoVisitanteId;
    if (local === visitante) {
      throw new BadRequestException(
        'El equipo local y el visitante no pueden ser el mismo',
      );
    }

    if (dto.jornadaId) await this.jornadasService.findOne(dto.jornadaId);
    if (dto.equipoLocalId) await this.equiposService.findOne(dto.equipoLocalId);
    if (dto.equipoVisitanteId) {
      await this.equiposService.findOne(dto.equipoVisitanteId);
    }
    if (dto.sedeId) await this.sedesService.findOne(dto.sedeId);

    const cambiaEquipos =
      local !== partido.equipoLocalId ||
      visitante !== partido.equipoVisitanteId;

    const estadosActivos = ['EN_JUEGO', 'FINALIZADO'];
    const iniciandoOFinalizando =
      dto.estado !== undefined &&
      estadosActivos.includes(dto.estado) &&
      !estadosActivos.includes(partido.estado);

    if (cambiaEquipos || iniciandoOFinalizando) {
      await this.validarJugadoresMinimos([local, visitante]);
    }

    if (iniciandoOFinalizando) {
      await this.validarAlineacionesDefinidas(id, [local, visitante]);
    }

    await this.partidosGateway.update(id, dto);
    const actualizado = await this.findOne(id);

    if (actualizado.serieId) {
      await this.liguillaService.procesarPartido(actualizado);
      if (actualizado.jornada?.torneoId) {
        this.liguillaService.notificarCambioBracket(actualizado.jornada.torneoId);
      }
    }

    return actualizado;
  }

  /** Actualiza el marcador en el microservicio cuando cambian los registros en goles */
  async sincronizarMarcador(
    partidoId: number,
    golesLocal: number,
    golesVisitante: number,
  ) {
    await this.partidosGateway.update(partidoId, {
      golesLocal,
      golesVisitante,
    });
    return this.findOne(partidoId);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.partidosGateway.remove(id);
  }
}