import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Not, Repository } from 'typeorm';
import { Tarjeta, type TipoTarjeta } from './entities/tarjeta.entity.js';
import { CreateTarjetaDto } from './dto/create-tarjeta.dto.js';
import { UpdateTarjetaDto } from './dto/update-tarjeta.dto.js';
import { PartidosService } from '../partidos/partidos.service.js';
import { JugadoresService } from '../jugadores/jugadores.service.js';
import {
  UserJwt,
  esDeEquipo,
  verificarArbitro,
} from '../auth/permisos.helper.js';
import { Rol } from '../auth/roles.enum.js';

export type TarjetaConPartido = Tarjeta & { partido?: any };

@Injectable()
export class TarjetasService {
  constructor(
    @InjectRepository(Tarjeta)
    private readonly tarjetaRepository: Repository<Tarjeta>,
    private readonly partidosService: PartidosService,
    private readonly jugadoresService: JugadoresService,
  ) {}

  private async validarTarjeta(
    partidoId: number,
    jugadorId: number,
    tipo: TipoTarjeta,
    excluirId?: number,
    user?: UserJwt,
  ): Promise<void> {
    const partido = await this.partidosService.findOne(partidoId);
    if (user) verificarArbitro(user, partido.arbitroId ?? -1);

    const jugador = await this.jugadoresService.findOne(jugadorId);

    if (
      jugador.equipoId !== partido.equipoLocalId &&
      jugador.equipoId !== partido.equipoVisitanteId
    ) {
      throw new BadRequestException(
        'El jugador no pertenece a ninguno de los equipos de este partido',
      );
    }

    const previas = await this.tarjetaRepository.find({
      where: {
        partidoId,
        jugadorId,
        ...(excluirId ? { id: Not(excluirId) } : {}),
      },
    });

    if (previas.some((t) => t.tipo === 'ROJA')) {
      throw new ConflictException(
        'Este jugador ya fue expulsado en este partido',
      );
    }

    const amarillas = previas.filter((t) => t.tipo === 'AMARILLA').length;
    if (tipo === 'AMARILLA' && amarillas >= 2) {
      throw new ConflictException(
        'Este jugador ya tiene 2 amarillas en este partido',
      );
    }
  }

  async create(dto: CreateTarjetaDto, user?: UserJwt): Promise<Tarjeta> {
    await this.validarTarjeta(
      dto.partidoId,
      dto.jugadorId,
      dto.tipo,
      undefined,
      user,
    );

    const tarjeta = this.tarjetaRepository.create(dto);
    return this.tarjetaRepository.save(tarjeta);
  }

  async findAll(user?: UserJwt): Promise<TarjetaConPartido[]> {
    // Una sola llamada TCP al microservicio para filtrar e hidratar sin N+1
    const partidosVisibles = await this.partidosService.findAll(user);
    const partidosMap = new Map(partidosVisibles.map((p) => [p.id, p]));

    let where: FindOptionsWhere<Tarjeta> | undefined;
    if (user?.rol === Rol.ARBITRO) {
      const partidoIds = partidosVisibles.map((p) => p.id);
      if (partidoIds.length === 0) return [];
      where = { partidoId: In(partidoIds) };
    } else if (user && esDeEquipo(user)) {
      where = { jugador: { equipoId: user.equipoId ?? -1 } };
    }

    const tarjetas = await this.tarjetaRepository.find({
      where,
      relations: { jugador: true },
    });

    return tarjetas.map((t) =>
      Object.assign(t, { partido: partidosMap.get(t.partidoId) ?? null }),
    );
  }

  async findByPartido(partidoId: number, user?: UserJwt): Promise<Tarjeta[]> {
    await this.partidosService.findOne(partidoId, user);

    return this.tarjetaRepository.find({
      where: { partidoId },
      relations: { jugador: true },
      order: { minuto: 'ASC' },
    });
  }

  async findOne(id: number, user?: UserJwt): Promise<TarjetaConPartido> {
    const tarjeta = await this.tarjetaRepository.findOne({
      where: { id },
      relations: { jugador: true },
    });
    if (!tarjeta) {
      throw new NotFoundException(`Tarjeta con ID ${id} no encontrada`);
    }

    const partido = await this.partidosService
      .findOne(tarjeta.partidoId)
      .catch(() => null);

    if (user?.rol === Rol.ARBITRO && partido?.arbitroId !== user.id) {
      throw new ForbiddenException('Esta tarjeta no es de tus partidos');
    }
    if (
      user &&
      esDeEquipo(user) &&
      tarjeta.jugador.equipoId !== user.equipoId
    ) {
      throw new ForbiddenException('Esta tarjeta no es de tu equipo');
    }

    // Object.assign conserva la instancia de entidad Tarjeta para repository.remove()
    return Object.assign(tarjeta, { partido });
  }

  async update(
    id: number,
    dto: UpdateTarjetaDto,
    user?: UserJwt,
  ): Promise<TarjetaConPartido> {
    const actual = await this.findOne(id);
    if (Object.keys(dto).length === 0) return actual;

    if (user) verificarArbitro(user, actual.partido?.arbitroId ?? -1);

    await this.validarTarjeta(
      dto.partidoId ?? actual.partidoId,
      dto.jugadorId ?? actual.jugadorId,
      dto.tipo ?? actual.tipo,
      id,
      user,
    );

    await this.tarjetaRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number, user?: UserJwt): Promise<void> {
    const tarjeta = await this.findOne(id);
    if (user) verificarArbitro(user, tarjeta.partido?.arbitroId ?? -1);
    await this.tarjetaRepository.remove(tarjeta);
  }
}