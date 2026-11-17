import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Tarjeta, type TipoTarjeta } from './entities/tarjeta.entity.js';
import { CreateTarjetaDto } from './dto/create-tarjeta.dto.js';
import { UpdateTarjetaDto } from './dto/update-tarjeta.dto.js';
import { PartidosService } from '../partidos/partidos.service.js';
import { JugadoresService } from '../jugadores/jugadores.service.js';

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
   */
  private async validarTarjeta(
    partidoId: number,
    jugadorId: number,
    tipo: TipoTarjeta,
    excluirId?: number,
  ): Promise<void> {
    const partido = await this.partidosService.findOne(partidoId);
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

  async create(dto: CreateTarjetaDto): Promise<Tarjeta> {
    await this.validarTarjeta(dto.partidoId, dto.jugadorId, dto.tipo);

    const tarjeta = this.tarjetaRepository.create(dto);
    return this.tarjetaRepository.save(tarjeta);
  }

  async findAll(): Promise<Tarjeta[]> {
    return this.tarjetaRepository.find({
      relations: { partido: true, jugador: true },
    });
  }

  async findByPartido(partidoId: number): Promise<Tarjeta[]> {
    return this.tarjetaRepository.find({
      where: { partidoId },
      relations: { jugador: true },
      order: { minuto: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Tarjeta> {
    const tarjeta = await this.tarjetaRepository.findOne({
      where: { id },
      relations: { partido: true, jugador: true },
    });
    if (!tarjeta) {
      throw new NotFoundException(`Tarjeta con ID ${id} no encontrada`);
    }
    return tarjeta;
  }

  async update(id: number, dto: UpdateTarjetaDto): Promise<Tarjeta> {
    const actual = await this.findOne(id);
    if (Object.keys(dto).length === 0) return actual;

    await this.validarTarjeta(
      dto.partidoId ?? actual.partidoId,
      dto.jugadorId ?? actual.jugadorId,
      dto.tipo ?? actual.tipo,
      id,
    );

    // update() en vez de save(): con las relaciones cargadas, TypeORM podía
    // ignorar el partidoId / jugadorId nuevo y quedarse con el viejo
    await this.tarjetaRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const tarjeta = await this.findOne(id);
    await this.tarjetaRepository.remove(tarjeta);
  }
}