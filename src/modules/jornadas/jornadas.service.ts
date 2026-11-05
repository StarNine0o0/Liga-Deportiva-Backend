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

    if (dto.torneoId) {
      await this.torneosService.findOne(dto.torneoId);
    }

    const torneoId = dto.torneoId ?? jornada.torneoId;
    const numero = dto.numero ?? jornada.numero;
    if (torneoId !== jornada.torneoId || numero !== jornada.numero) {
      await this.verificarNumero(torneoId, numero);
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
}