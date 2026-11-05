import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gol } from './entities/gol.entity.js';
import { CreateGolDto } from './dto/create-gol.dto.js';
import { UpdateGolDto } from './dto/update-gol.dto.js';
import { EquiposService } from '../equipos/equipos.service.js';

@Injectable()
export class GolesService {
  constructor(
    @InjectRepository(Gol)
    private readonly golRepository: Repository<Gol>,
    private readonly equiposService: EquiposService,
  ) {}

  async create(createGolDto: CreateGolDto): Promise<Gol> {
    // Verificar que el equipo existe
    await this.equiposService.findOne(createGolDto.equipoId);

    const gol = this.golRepository.create(createGolDto);
    return this.golRepository.save(gol);
  }

  async findAll(): Promise<Gol[]> {
    return this.golRepository.find({
      relations: { equipo: true },
    });
  }

  async findOne(id: number): Promise<Gol> {
    const gol = await this.golRepository.findOne({
      where: { id },
      relations: { equipo: true },
    });
    if (!gol) {
      throw new NotFoundException(`Gol con ID ${id} no encontrado`);
    }
    return gol;
  }

  async findByPartido(partidoId: number): Promise<Gol[]> {
    return this.golRepository.find({
      where: { partidoId },
      relations: { equipo: true },
    });
  }

  async update(id: number, updateGolDto: UpdateGolDto): Promise<Gol> {
    const gol = await this.findOne(id);

    if (updateGolDto.equipoId) {
      await this.equiposService.findOne(updateGolDto.equipoId);
    }

    Object.assign(gol, updateGolDto);
    return this.golRepository.save(gol);
  }

  async remove(id: number): Promise<void> {
    const gol = await this.findOne(id);
    await this.golRepository.remove(gol);
  }
}

