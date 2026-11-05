import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Temporada } from './entities/temporada.entity.js';
import { CreateTemporadaDto } from './dto/create-temporada.dto.js';
import { UpdateTemporadaDto } from './dto/update-temporada.dto.js';

@Injectable()
export class TemporadasService {
  constructor(
    @InjectRepository(Temporada)
    private readonly temporadaRepository: Repository<Temporada>,
  ) {}

  async create(dto: CreateTemporadaDto): Promise<Temporada> {
    if (dto.fechaFin < dto.fechaInicio) {
      throw new BadRequestException(
        'La fecha fin no puede ser anterior a la fecha inicio',
      );
    }

    const existe = await this.temporadaRepository.findOne({
      where: { nombre: dto.nombre },
    });
    if (existe) {
      throw new ConflictException(`La temporada "${dto.nombre}" ya existe`);
    }

    const temporada = this.temporadaRepository.create(dto);
    return this.temporadaRepository.save(temporada);
  }

  async findAll(): Promise<Temporada[]> {
    return this.temporadaRepository.find();
  }

  async findOne(id: number): Promise<Temporada> {
    const temporada = await this.temporadaRepository.findOne({
      where: { id },
    });
    if (!temporada) {
      throw new NotFoundException(`Temporada con ID ${id} no encontrada`);
    }
    return temporada;
  }

  async update(id: number, dto: UpdateTemporadaDto): Promise<Temporada> {
    const temporada = await this.findOne(id);

    if (dto.nombre && dto.nombre !== temporada.nombre) {
      const existe = await this.temporadaRepository.findOne({
        where: { nombre: dto.nombre },
      });
      if (existe) {
        throw new ConflictException(`La temporada "${dto.nombre}" ya existe`);
      }
    }

    const inicio = dto.fechaInicio ?? temporada.fechaInicio;
    const fin = dto.fechaFin ?? temporada.fechaFin;
    if (fin < inicio) {
      throw new BadRequestException(
        'La fecha fin no puede ser anterior a la fecha inicio',
      );
    }

    Object.assign(temporada, dto);
    return this.temporadaRepository.save(temporada);
  }

  async remove(id: number): Promise<void> {
    const temporada = await this.findOne(id);
    await this.temporadaRepository.remove(temporada);
  }
}