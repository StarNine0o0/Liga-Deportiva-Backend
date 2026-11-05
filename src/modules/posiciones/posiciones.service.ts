import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Posicion } from './entities/posicion.entity.js';
import { CreatePosicionDto } from './dto/create-posicion.dto.js';
import { UpdatePosicionDto } from './dto/update-posicion.dto.js';
import { EquiposService } from '../equipos/equipos.service.js';

@Injectable()
export class PosicionesService {
  constructor(
    @InjectRepository(Posicion)
    private readonly posicionRepository: Repository<Posicion>,
    private readonly equiposService: EquiposService,
  ) {}

  async create(createPosicionDto: CreatePosicionDto): Promise<Posicion> {
    // Verificar que el equipo existe
    await this.equiposService.findOne(createPosicionDto.equipoId);

    const posicion = this.posicionRepository.create(createPosicionDto);
    return this.posicionRepository.save(posicion);
  }

  async findAll(): Promise<Posicion[]> {
    return this.posicionRepository.find({
      relations: { equipo: true },
    });
  }

  async findOne(id: number): Promise<Posicion> {
    const posicion = await this.posicionRepository.findOne({
      where: { id },
      relations: { equipo: true },
    });
    if (!posicion) {
      throw new NotFoundException(`Posición con ID ${id} no encontrada`);
    }
    return posicion;
  }

  /**
   * Obtiene la tabla de posiciones de un torneo, ordenada por puntos DESC,
   * diferencia de goles DESC y goles a favor DESC.
   */
  async findByTorneo(torneoId: number): Promise<Posicion[]> {
    return this.posicionRepository.find({
      where: { torneoId },
      relations: { equipo: true },
      order: {
        pts: 'DESC',
        gf: 'DESC',
      },
    });
  }

  async update(
    id: number,
    updatePosicionDto: UpdatePosicionDto,
  ): Promise<Posicion> {
    const posicion = await this.findOne(id);

    if (updatePosicionDto.equipoId) {
      await this.equiposService.findOne(updatePosicionDto.equipoId);
    }

    Object.assign(posicion, updatePosicionDto);
    return this.posicionRepository.save(posicion);
  }

  async remove(id: number): Promise<void> {
    const posicion = await this.findOne(id);
    await this.posicionRepository.remove(posicion);
  }
}

