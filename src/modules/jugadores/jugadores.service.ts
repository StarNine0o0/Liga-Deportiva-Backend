import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Jugador } from './entities/jugadores.entity.js';
import { CreateJugadorDto } from './dto/create-jugadore.dto.js';
import { UpdateJugadorDto } from './dto/update-jugadore.dto.js';
import { EquiposService } from '../equipos/equipos.service.js';

@Injectable()
export class JugadoresService {
  constructor(
    @InjectRepository(Jugador)
    private readonly jugadorRepository: Repository<Jugador>,
    private readonly equiposService: EquiposService,
  ) {}

  async create(dto: CreateJugadorDto): Promise<Jugador> {
    // Lanza 404 si el equipo no existe
    await this.equiposService.findOne(dto.equipoId);
    await this.verificarCamiseta(dto.equipoId, dto.numeroCamiseta);

    const jugador = this.jugadorRepository.create(dto);
    return this.jugadorRepository.save(jugador);
  }

  async findAll(): Promise<Jugador[]> {
    return this.jugadorRepository.find({ relations: { equipo: true } });
  }

  async findByEquipo(equipoId: number): Promise<Jugador[]> {
    return this.jugadorRepository.find({
      where: { equipoId },
      relations: { equipo: true },
    });
  }

  async findOne(id: number): Promise<Jugador> {
    const jugador = await this.jugadorRepository.findOne({
      where: { id },
      relations: { equipo: true },
    });
    if (!jugador) {
      throw new NotFoundException(`Jugador con ID ${id} no encontrado`);
    }
    return jugador;
  }

  async update(id: number, dto: UpdateJugadorDto): Promise<Jugador> {
    const jugador = await this.findOne(id);

    if (dto.equipoId) {
      await this.equiposService.findOne(dto.equipoId);
    }

    const equipoId = dto.equipoId ?? jugador.equipoId;
    const numero = dto.numeroCamiseta ?? jugador.numeroCamiseta;
    if (equipoId !== jugador.equipoId || numero !== jugador.numeroCamiseta) {
      await this.verificarCamiseta(equipoId, numero);
    }

    Object.assign(jugador, dto);
    return this.jugadorRepository.save(jugador);
  }

  async remove(id: number): Promise<void> {
    const jugador = await this.findOne(id);
    await this.jugadorRepository.remove(jugador);
  }

  private async verificarCamiseta(equipoId: number, numero: number) {
    const existe = await this.jugadorRepository.findOne({
      where: { equipoId, numeroCamiseta: numero },
    });
    if (existe) {
      throw new ConflictException(
        `El número ${numero} ya lo usa otro jugador de ese equipo`,
      );
    }
  }
}