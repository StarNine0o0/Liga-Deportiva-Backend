import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from './entities/rol.entity.js';
import { CreateRolDto } from './dto/create-rol.dto.js';
import { UpdateRolDto } from './dto/update-rol.dto.js';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
  ) {}

  async create(createRolDto: CreateRolDto): Promise<Rol> {
    const existe = await this.rolRepository.findOne({
      where: { nombre: createRolDto.nombre },
    });
    if (existe) {
      throw new ConflictException(
        `El rol "${createRolDto.nombre}" ya existe`,
      );
    }

    const rol = this.rolRepository.create(createRolDto);
    return this.rolRepository.save(rol);
  }

  async findAll(): Promise<Rol[]> {
    return this.rolRepository.find();
  }

  async findOne(id: number): Promise<Rol> {
    const rol = await this.rolRepository.findOne({ where: { id } });
    if (!rol) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }
    return rol;
  }

  async findByNombre(nombre: string): Promise<Rol | null> {
    return this.rolRepository.findOne({ where: { nombre } });
  }

  async update(id: number, updateRolDto: UpdateRolDto): Promise<Rol> {
    const rol = await this.findOne(id);

    if (updateRolDto.nombre && updateRolDto.nombre !== rol.nombre) {
      const existe = await this.rolRepository.findOne({
        where: { nombre: updateRolDto.nombre },
      });
      if (existe) {
        throw new ConflictException(
          `El rol "${updateRolDto.nombre}" ya existe`,
        );
      }
    }

    Object.assign(rol, updateRolDto);
    return this.rolRepository.save(rol);
  }

  async remove(id: number): Promise<void> {
    const rol = await this.findOne(id);
    await this.rolRepository.remove(rol);
  }
}

