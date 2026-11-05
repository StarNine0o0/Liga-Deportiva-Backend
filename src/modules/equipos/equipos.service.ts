import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipo } from './entities/equipo.entity.js';
import { CreateEquipoDto } from './dto/create-equipo.dto.js';
import { UpdateEquipoDto } from './dto/update-equipo.dto.js';
import { UsuariosService } from '../usuarios/usuarios.service.js';

@Injectable()
export class EquiposService {
  constructor(
    @InjectRepository(Equipo)
    private readonly equipoRepository: Repository<Equipo>,
    private readonly usuariosService: UsuariosService,
  ) {}

  async create(createEquipoDto: CreateEquipoDto): Promise<Equipo> {
    // Verificar que el capitán existe
    const capitan = await this.usuariosService.findOne(
      createEquipoDto.capitanId,
    );
    if (!capitan) {
      throw new BadRequestException(
        `Usuario capitán con ID ${createEquipoDto.capitanId} no existe`,
      );
    }

    // Verificar nombre único
    const existe = await this.equipoRepository.findOne({
      where: { nombre: createEquipoDto.nombre },
    });
    if (existe) {
      throw new ConflictException(
        `El equipo "${createEquipoDto.nombre}" ya existe`,
      );
    }

    const equipo = this.equipoRepository.create(createEquipoDto);
    return this.equipoRepository.save(equipo);
  }

  async findAll(): Promise<Equipo[]> {
    return this.equipoRepository.find({
      relations: { capitan: true, sede: true },
    });
  }

  async findOne(id: number): Promise<Equipo> {
    const equipo = await this.equipoRepository.findOne({
      where: { id },
      relations: { capitan: true, sede: true },
    });
    if (!equipo) {
      throw new NotFoundException(`Equipo con ID ${id} no encontrado`);
    }
    return equipo;
  }

  async update(
    id: number,
    updateEquipoDto: UpdateEquipoDto,
  ): Promise<Equipo> {
    const equipo = await this.findOne(id);

    // Si cambia el capitán, verificar que existe
    if (updateEquipoDto.capitanId) {
      await this.usuariosService.findOne(updateEquipoDto.capitanId);
    }

    // Si cambia el nombre, verificar duplicado
    if (updateEquipoDto.nombre && updateEquipoDto.nombre !== equipo.nombre) {
      const existe = await this.equipoRepository.findOne({
        where: { nombre: updateEquipoDto.nombre },
      });
      if (existe) {
        throw new ConflictException(
          `El equipo "${updateEquipoDto.nombre}" ya existe`,
        );
      }
    }

    Object.assign(equipo, updateEquipoDto);
    return this.equipoRepository.save(equipo);
  }

  async remove(id: number): Promise<void> {
    const equipo = await this.findOne(id);
    await this.equipoRepository.remove(equipo);
  }
}

