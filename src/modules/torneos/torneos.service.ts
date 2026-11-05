import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Torneo } from './entities/torneo.entity.js';
import { CreateTorneoDto } from './dto/create-torneo.dto.js';
import { UpdateTorneoDto } from './dto/update-torneo.dto.js';
import { TemporadasService } from '../temporadas/temporadas.service.js';

@Injectable()
export class TorneosService {
  constructor(
    @InjectRepository(Torneo)
    private readonly torneoRepository: Repository<Torneo>,
    private readonly temporadasService: TemporadasService,
  ) {}

  async create(dto: CreateTorneoDto): Promise<Torneo> {
    if (dto.fechaFin < dto.fechaInicio) {
      throw new BadRequestException(
        'La fecha fin no puede ser anterior a la fecha inicio',
      );
    }

    // Lanza 404 si la temporada no existe
    await this.temporadasService.findOne(dto.temporadaId);

    const torneo = this.torneoRepository.create(dto);
    return this.torneoRepository.save(torneo);
  }

  async findAll(): Promise<Torneo[]> {
    return this.torneoRepository.find({
      relations: { temporada: true },
    });
  }

  async findOne(id: number): Promise<Torneo> {
    const torneo = await this.torneoRepository.findOne({
      where: { id },
      relations: { temporada: true },
    });
    if (!torneo) {
      throw new NotFoundException(`Torneo con ID ${id} no encontrado`);
    }
    return torneo;
  }

  async update(id: number, dto: UpdateTorneoDto): Promise<Torneo> {
    const torneo = await this.findOne(id);

    if (dto.temporadaId) {
      await this.temporadasService.findOne(dto.temporadaId);
    }

    const inicio = dto.fechaInicio ?? torneo.fechaInicio;
    const fin = dto.fechaFin ?? torneo.fechaFin;
    if (fin < inicio) {
      throw new BadRequestException(
        'La fecha fin no puede ser anterior a la fecha inicio',
      );
    }

    Object.assign(torneo, dto);
    return this.torneoRepository.save(torneo);
  }

  async remove(id: number): Promise<void> {
    const torneo = await this.findOne(id);
    await this.torneoRepository.remove(torneo);
  }
}