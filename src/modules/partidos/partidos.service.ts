import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Partido } from './entities/partido.entity.js';
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

export const MIN_JUGADORES_POR_EQUIPO = 9;

/** Campos que un árbitro sí puede modificar en su partido */
const CAMPOS_ARBITRO = ['golesLocal', 'golesVisitante', 'estado'];

@Injectable()
export class PartidosService {
  constructor(
    @InjectRepository(Partido)
    private readonly partidoRepository: Repository<Partido>,
    private readonly jornadasService: JornadasService,
    private readonly equiposService: EquiposService,
    private readonly sedesService: SedesService,
    private readonly jugadoresService: JugadoresService,
  ) {}

  /** Filtro de visibilidad según el rol (admin e invitado ven todo) */
  private scope(
    user?: UserJwt,
    extra: FindOptionsWhere<Partido> = {},
  ): FindOptionsWhere<Partido> | FindOptionsWhere<Partido>[] {
    if (user?.rol === Rol.ARBITRO) {
      return { ...extra, arbitroId: user.id };
    }
    if (user && esDeEquipo(user)) {
      const eq = user.equipoId ?? -1;
      return [
        { ...extra, equipoLocalId: eq },
        { ...extra, equipoVisitanteId: eq },
      ];
    }
    return extra;
  }

  /** Cada equipo debe tener mínimo 9 jugadores registrados para poder jugar */
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

  async create(dto: CreatePartidoDto): Promise<Partido> {
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

    const partido = this.partidoRepository.create(dto);
    return this.partidoRepository.save(partido);
  }

  async findAll(user?: UserJwt): Promise<Partido[]> {
    return this.partidoRepository.find({
      where: this.scope(user),
      relations: {
        jornada: true,
        equipoLocal: true,
        equipoVisitante: true,
        sede: true,
      },
    });
  }

  async findByJornada(jornadaId: number, user?: UserJwt): Promise<Partido[]> {
    return this.partidoRepository.find({
      where: this.scope(user, { jornadaId }),
      relations: { equipoLocal: true, equipoVisitante: true, sede: true },
      order: { fechaHora: 'ASC' },
    });
  }

  async findOne(id: number, user?: UserJwt): Promise<Partido> {
    const partido = await this.partidoRepository.findOne({
      where: { id },
      relations: {
        jornada: true,
        equipoLocal: true,
        equipoVisitante: true,
        sede: true,
      },
    });
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

    return partido;
  }

  async update(
    id: number,
    dto: UpdatePartidoDto,
    user?: UserJwt,
  ): Promise<Partido> {
    const partido = await this.findOne(id);
    if (Object.keys(dto).length === 0) return partido;

    // El árbitro solo puede tocar su partido y solo resultado/estado
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

    // Se revalida si cambian los equipos o si el partido está por iniciar
    const cambiaEquipos =
      local !== partido.equipoLocalId ||
      visitante !== partido.equipoVisitanteId;
    const iniciando =
      dto.estado === 'EN_JUEGO' && partido.estado !== 'EN_JUEGO';
    if (cambiaEquipos || iniciando) {
      await this.validarJugadoresMinimos([local, visitante]);
    }

    // update() en vez de assign + save: con las relaciones cargadas, TypeORM
    // podía ignorar el equipoLocalId / equipoVisitanteId nuevo
    const { fechaHora, ...resto } = dto;
    await this.partidoRepository.update(id, {
      ...resto,
      ...(fechaHora ? { fechaHora: new Date(fechaHora) } : {}),
    });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const partido = await this.findOne(id);
    await this.partidoRepository.remove(partido);
  }
}