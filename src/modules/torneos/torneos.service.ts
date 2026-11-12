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
import { Temporada } from '../temporadas/entities/temporada.entity.js';

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

    const temporadaId = dto.temporadaId ?? torneo.temporadaId;
    const temporada =
      dto.temporadaId && dto.temporadaId !== torneo.temporadaId
        ? await this.temporadasService.findOne(dto.temporadaId)
        : torneo.temporada ?? (await this.temporadasService.findOne(temporadaId));

    const inicio = dto.fechaInicio ?? torneo.fechaInicio;
    const fin = dto.fechaFin ?? torneo.fechaFin;
    if (fin < inicio) {
      throw new BadRequestException(
        'La fecha fin no puede ser anterior a la fecha inicio',
      );
    }

    this.validarFechasEnTemporada(inicio, fin, temporada);

    Object.assign(torneo, dto);
    return this.torneoRepository.save(torneo);
  }

  async remove(id: number): Promise<void> {
    const torneo = await this.findOne(id);
    await this.torneoRepository.remove(torneo);
  }
  //normaliza las fechas para que se puedan comparar
  private normalizarFecha(valor: string | Date): string {
    if (valor instanceof Date) {
      return valor.toISOString().split('T')[0];
    }
    return String(valor).split('T')[0];
  }

  private validarFechasEnTemporada(
    fechaInicio: string | Date,
    fechaFin: string | Date,
    temporada: Temporada,
  ) {
    const fInicioTorneo = this.normalizarFecha(fechaInicio);
    const fFinTorneo = this.normalizarFecha(fechaFin);
    const fInicioTemp = temporada.fechaInicio
      ? this.normalizarFecha(temporada.fechaInicio)
      : null;
    const fFinTemp = temporada.fechaFin
      ? this.normalizarFecha(temporada.fechaFin)
      : null;

    if (fInicioTemp && fInicioTorneo < fInicioTemp) {
      throw new BadRequestException(
        `La fecha de inicio del torneo (${fInicioTorneo}) no puede ser anterior al inicio de la temporada (${fInicioTemp})`,
      );
    }

    if (fFinTemp && fFinTorneo > fFinTemp) {
      throw new BadRequestException(
        `La fecha de fin del torneo (${fFinTorneo}) no puede ser posterior al fin de la temporada (${fFinTemp})`,
      );
    }
  }



}