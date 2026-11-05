import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TorneoEquipo } from './entities/torneo-equipo.entity.js';
import { CreateTorneoEquipoDto } from './dto/create-torneo-equipo.dto.js';
import { UpdateTorneoEquipoDto } from './dto/update-torneo-equipo.dto.js';
import { EquiposService } from '../equipos/equipos.service.js';

@Injectable()
export class TorneoEquipoService {
  constructor(
    @InjectRepository(TorneoEquipo)
    private readonly torneoEquipoRepository: Repository<TorneoEquipo>,
    private readonly equiposService: EquiposService,
  ) {}

  async create(
    createTorneoEquipoDto: CreateTorneoEquipoDto,
  ): Promise<TorneoEquipo> {
    // Verificar que el equipo existe
    await this.equiposService.findOne(createTorneoEquipoDto.equipoId);

    // Verificar que no esté ya inscrito en este torneo
    const existe = await this.torneoEquipoRepository.findOne({
      where: {
        torneoId: createTorneoEquipoDto.torneoId,
        equipoId: createTorneoEquipoDto.equipoId,
      },
    });
    if (existe) {
      throw new BadRequestException(
        'El equipo ya está inscrito en este torneo',
      );
    }

    const torneoEquipo = this.torneoEquipoRepository.create(
      createTorneoEquipoDto,
    );
    return this.torneoEquipoRepository.save(torneoEquipo);
  }

  async findAll(): Promise<TorneoEquipo[]> {
    return this.torneoEquipoRepository.find({
      relations: { equipo: true },
    });
  }

  async findOne(id: number): Promise<TorneoEquipo> {
    const torneoEquipo = await this.torneoEquipoRepository.findOne({
      where: { id },
      relations: { equipo: true },
    });
    if (!torneoEquipo) {
      throw new NotFoundException(
        `Inscripción torneo-equipo con ID ${id} no encontrada`,
      );
    }
    return torneoEquipo;
  }

  async findByTorneo(torneoId: number): Promise<TorneoEquipo[]> {
    return this.torneoEquipoRepository.find({
      where: { torneoId },
      relations: { equipo: true },
    });
  }

  async update(
    id: number,
    updateTorneoEquipoDto: UpdateTorneoEquipoDto,
  ): Promise<TorneoEquipo> {
    const torneoEquipo = await this.findOne(id);

    if (updateTorneoEquipoDto.equipoId) {
      await this.equiposService.findOne(updateTorneoEquipoDto.equipoId);
    }

    Object.assign(torneoEquipo, updateTorneoEquipoDto);
    return this.torneoEquipoRepository.save(torneoEquipo);
  }

  async remove(id: number): Promise<void> {
    const torneoEquipo = await this.findOne(id);
    await this.torneoEquipoRepository.remove(torneoEquipo);
  }
}

