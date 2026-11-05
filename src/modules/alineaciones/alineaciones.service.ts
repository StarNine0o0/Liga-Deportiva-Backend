import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alineacion } from './entities/alineacion.entity.js';
import { CreateAlineacionDto } from './dto/create-alineacion.dto.js';
import { UpdateAlineacionDto } from './dto/update-alineacion.dto.js';
import { EquiposService } from '../equipos/equipos.service.js';

@Injectable()
export class AlineacionesService {
  constructor(
    @InjectRepository(Alineacion)
    private readonly alineacionRepository: Repository<Alineacion>,
    private readonly equiposService: EquiposService,
  ) {}

  async create(
    createAlineacionDto: CreateAlineacionDto,
  ): Promise<Alineacion> {
    // Verificar que el equipo existe
    await this.equiposService.findOne(createAlineacionDto.equipoId);

    const alineacion = this.alineacionRepository.create(createAlineacionDto);
    return this.alineacionRepository.save(alineacion);
  }

  async findAll(): Promise<Alineacion[]> {
    return this.alineacionRepository.find({
      relations: { equipo: true },
    });
  }

  async findOne(id: number): Promise<Alineacion> {
    const alineacion = await this.alineacionRepository.findOne({
      where: { id },
      relations: { equipo: true },
    });
    if (!alineacion) {
      throw new NotFoundException(`Alineación con ID ${id} no encontrada`);
    }
    return alineacion;
  }

  async findByPartido(partidoId: number): Promise<Alineacion[]> {
    return this.alineacionRepository.find({
      where: { partidoId },
      relations: { equipo: true },
    });
  }

  async update(
    id: number,
    updateAlineacionDto: UpdateAlineacionDto,
  ): Promise<Alineacion> {
    const alineacion = await this.findOne(id);

    if (updateAlineacionDto.equipoId) {
      await this.equiposService.findOne(updateAlineacionDto.equipoId);
    }

    Object.assign(alineacion, updateAlineacionDto);
    return this.alineacionRepository.save(alineacion);
  }

  async remove(id: number): Promise<void> {
    const alineacion = await this.findOne(id);
    await this.alineacionRepository.remove(alineacion);
  }
}

