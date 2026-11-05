import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tarjeta } from './entities/tarjeta.entity.js';
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

  async create(dto: CreateTarjetaDto): Promise<Tarjeta> {
    await this.partidosService.findOne(dto.partidoId);
    await this.jugadoresService.findOne(dto.jugadorId);

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
    const tarjeta = await this.findOne(id);

    if (dto.partidoId) await this.partidosService.findOne(dto.partidoId);
    if (dto.jugadorId) await this.jugadoresService.findOne(dto.jugadorId);

    Object.assign(tarjeta, dto);
    return this.tarjetaRepository.save(tarjeta);
  }

  async remove(id: number): Promise<void> {
    const tarjeta = await this.findOne(id);
    await this.tarjetaRepository.remove(tarjeta);
  }
}