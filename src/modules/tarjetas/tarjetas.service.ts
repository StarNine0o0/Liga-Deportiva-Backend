import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Not, Repository } from 'typeorm';
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

@Injectable()
export class TarjetasService {
  constructor(
    @InjectRepository(Tarjeta)
    private readonly tarjetaRepository: Repository<Tarjeta>,
    private readonly partidosService: PartidosService,
    private readonly jugadoresService: JugadoresService,
  ) {}

  /**
   * Reglas de negocio de una tarjeta.
   * excluirId: al editar, ignora la propia tarjeta en el conteo.
   * user: si viene, el árbitro solo puede operar en sus partidos.
   */
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

  async findAll(user?: UserJwt): Promise<Tarjeta[]> {
    let where: FindOptionsWhere<Tarjeta> | undefined;
    if (user?.rol === Rol.ARBITRO) {
      where = { partido: { arbitroId: user.id } };
    } else if (user && esDeEquipo(user)) {
      where = { jugador: { equipoId: user.equipoId ?? -1 } };
    }

    return this.tarjetaRepository.find({
      where,
      relations: { partido: true, jugador: true },
    });
  }

  async findByPartido(partidoId: number, user?: UserJwt): Promise<Tarjeta[]> {
    // Lanza 403 si el partido no le corresponde al árbitro / equipo
    await this.partidosService.findOne(partidoId, user);

    return this.tarjetaRepository.find({
      where: { partidoId },
      relations: { jugador: true },
      order: { minuto: 'ASC' },
    });
  }

  async findOne(id: number, user?: UserJwt): Promise<Tarjeta> {
    const tarjeta = await this.tarjetaRepository.findOne({
      where: { id },
      relations: { partido: true, jugador: true },
    });
    if (!tarjeta) {
      throw new NotFoundException(`Tarjeta con ID ${id} no encontrada`);
    }

    if (user?.rol === Rol.ARBITRO && tarjeta.partido.arbitroId !== user.id) {
      throw new ForbiddenException('Esta tarjeta no es de tus partidos');
    }
    if (
      user &&
      esDeEquipo(user) &&
      tarjeta.jugador.equipoId !== user.equipoId
    ) {
      throw new ForbiddenException('Esta tarjeta no es de tu equipo');
    }

    return tarjeta;
  }

  async update(
    id: number,
    dto: UpdateTarjetaDto,
    user?: UserJwt,
  ): Promise<Tarjeta> {
    const actual = await this.findOne(id);
    if (Object.keys(dto).length === 0) return actual;

    // El partido actual de la tarjeta debe ser del árbitro...
    if (user) verificarArbitro(user, actual.partido.arbitroId ?? -1);

    // ...y el nuevo (si lo cambia) también, se revisa dentro de validarTarjeta
    await this.validarTarjeta(
      dto.partidoId ?? actual.partidoId,
      dto.jugadorId ?? actual.jugadorId,
      dto.tipo ?? actual.tipo,
      id,
      user,
    );

    // update() en vez de save(): con las relaciones cargadas, TypeORM podía
    // ignorar el partidoId / jugadorId nuevo y quedarse con el viejo
    await this.tarjetaRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number, user?: UserJwt): Promise<void> {
    const tarjeta = await this.findOne(id);
    if (user) verificarArbitro(user, tarjeta.partido.arbitroId ?? -1);
    await this.tarjetaRepository.remove(tarjeta);
  }
}