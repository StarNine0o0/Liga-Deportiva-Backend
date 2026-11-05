import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sede } from './entities/sede.entity.js';
import { CreateSedeDto } from './dto/create-sede.dto.js';
import { UpdateSedeDto } from './dto/update-sede.dto.js';

@Injectable()
export class SedesService {
  constructor(
    @InjectRepository(Sede)
    private readonly sedeRepository: Repository<Sede>,
  ) {}

  async create(createSedeDto: CreateSedeDto): Promise<Sede> {
    const existe = await this.sedeRepository.findOne({
      where: { nombre: createSedeDto.nombre },
    });
    if (existe) {
      throw new ConflictException(
        `La sede "${createSedeDto.nombre}" ya existe`,
      );
    }

    const sede = this.sedeRepository.create(createSedeDto);
    return this.sedeRepository.save(sede);
  }

  async findAll(): Promise<Sede[]> {
    return this.sedeRepository.find();
  }

  async findOne(id: number): Promise<Sede> {
    const sede = await this.sedeRepository.findOne({ where: { id } });
    if (!sede) {
      throw new NotFoundException(`Sede con ID ${id} no encontrada`);
    }
    return sede;
  }

  async update(id: number, updateSedeDto: UpdateSedeDto): Promise<Sede> {
    const sede = await this.findOne(id);

    if (updateSedeDto.nombre && updateSedeDto.nombre !== sede.nombre) {
      const existe = await this.sedeRepository.findOne({
        where: { nombre: updateSedeDto.nombre },
      });
      if (existe) {
        throw new ConflictException(
          `La sede "${updateSedeDto.nombre}" ya existe`,
        );
      }
    }

    Object.assign(sede, updateSedeDto);
    return this.sedeRepository.save(sede);
  }

  async remove(id: number): Promise<void> {
    const sede = await this.findOne(id);
    await this.sedeRepository.remove(sede);
  }
}
