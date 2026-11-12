import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Jornada } from './entities/jornada.entity.js';
import { CreateJornadaDto } from './dto/create-jornada.dto.js';
import { UpdateJornadaDto } from './dto/update-jornada.dto.js';
import { TorneosService } from '../torneos/torneos.service.js';
import { Torneo } from '../torneos/entities/torneo.entity.js';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class JornadasService {
  constructor(
    @InjectRepository(Jornada)
    private readonly jornadaRepository: Repository<Jornada>,
    private readonly torneosService: TorneosService,
  ) {}

  async create(dto: CreateJornadaDto): Promise<Jornada> {
    await this.torneosService.findOne(dto.torneoId);
    await this.verificarNumero(dto.torneoId, dto.numero);

    const jornada = this.jornadaRepository.create(dto);
    return this.jornadaRepository.save(jornada);
  }

  async findAll(): Promise<Jornada[]> {
    return this.jornadaRepository.find({ relations: { torneo: true } });
  }

  async findByTorneo(torneoId: number): Promise<Jornada[]> {
    return this.jornadaRepository.find({
      where: { torneoId },
      relations: { torneo: true },
      order: { numero: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Jornada> {
    const jornada = await this.jornadaRepository.findOne({
      where: { id },
      relations: { torneo: true },
    });
    if (!jornada) {
      throw new NotFoundException(`Jornada con ID ${id} no encontrada`);
    }
    return jornada;
  }

 async update(id: number, dto: UpdateJornadaDto): Promise<Jornada> {
    const jornada = await this.findOne(id);

    const torneoId = dto.torneoId ?? jornada.torneoId;
    const torneo =
      dto.torneoId && dto.torneoId !== jornada.torneoId
        ? await this.torneosService.findOne(dto.torneoId)
        : jornada.torneo ?? (await this.torneosService.findOne(torneoId));

    const numero = dto.numero ?? jornada.numero;
    if (torneoId !== jornada.torneoId || numero !== jornada.numero) {
      await this.verificarNumero(torneoId, numero);
    }

    // Evaluamos la fecha resultante (si viene nueva en dto, o la que ya tenía si cambió de torneo)
    const fechaFinal =
      dto.fecha !== undefined ? dto.fecha : (jornada.fecha as unknown as string | null);

    if (fechaFinal) {
      this.validarFechaEnTorneo(fechaFinal, torneo);
    }

    Object.assign(jornada, dto);
    return this.jornadaRepository.save(jornada);
  }

  async remove(id: number): Promise<void> {
    const jornada = await this.findOne(id);
    await this.jornadaRepository.remove(jornada);
  }

  private async verificarNumero(torneoId: number, numero: number) {
    const existe = await this.jornadaRepository.findOne({
      where: { torneoId, numero },
    });
    if (existe) {
      throw new ConflictException(
        `La jornada ${numero} ya existe en ese torneo`,
      );
    }
  }

//Normaliza a YYYY-MM-DD para comparar fechas calendario sin desfase horario
  private normalizarFecha(valor: string | Date): string {
    if (valor instanceof Date) {
      return valor.toISOString().split('T')[0];
    }
    return String(valor).split('T')[0];
  }

  private validarFechaEnTorneo(fechaJornada: string | Date, torneo: Torneo) {
    const fJornada = this.normalizarFecha(fechaJornada);
    const fInicio = torneo.fechaInicio ? this.normalizarFecha(torneo.fechaInicio) : null;
    const fFin = torneo.fechaFin ? this.normalizarFecha(torneo.fechaFin) : null;

    if (fInicio && fJornada < fInicio) {
      throw new BadRequestException(
        `La fecha de la jornada (${fJornada}) no puede ser anterior al inicio del torneo (${fInicio})`,
      );
    }

    if (fFin && fJornada > fFin) {
      throw new BadRequestException(
        `La fecha de la jornada (${fJornada}) no puede ser posterior al fin del torneo (${fFin})`,
      );
    }
  }
}
