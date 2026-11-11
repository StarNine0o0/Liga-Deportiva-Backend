import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sede } from './entities/sede.entity.js';
import { SedeImagen } from './entities/sede-imagen.entity.js';
import { CreateSedeDto } from './dto/create-sede.dto.js';
import { UpdateSedeDto } from './dto/update-sede.dto.js';
import { ImageStorageService } from '../../common/uploads/image-storage.service.js';
import type { ArchivoSubido } from '../../common/uploads/image-storage.service.js';

/** Forma con la que el frontend recibe cada imagen */
export interface SedeImagenDto {
  id: number;
  orden: number;
  url: string; // ruta relativa: /api/sedes/:sedeId/imagenes/:imgId
}

export type SedeConImagenes = Omit<Sede, 'imagenes'> & {
  imagenes: SedeImagenDto[];
};

@Injectable()
export class SedesService {
  constructor(
    @InjectRepository(Sede)
    private readonly sedeRepository: Repository<Sede>,
    @InjectRepository(SedeImagen)
    private readonly sedeImagenRepository: Repository<SedeImagen>,
    private readonly images: ImageStorageService,
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

  async findAll(): Promise<SedeConImagenes[]> {
    const sedes = await this.sedeRepository.find({
      relations: { imagenes: true },
      order: { imagenes: { orden: 'ASC' } },
    });
    return sedes.map((s) => this.toDto(s));
  }

  async findOne(id: number): Promise<SedeConImagenes> {
    const sede = await this.sedeRepository.findOne({
      where: { id },
      relations: { imagenes: true },
      order: { imagenes: { orden: 'ASC' } },
    });
    if (!sede) {
      throw new NotFoundException(`Sede con ID ${id} no encontrada`);
    }
    return this.toDto(sede);
  }

  async update(id: number, updateSedeDto: UpdateSedeDto): Promise<Sede> {
    const sede = await this.sedeRepository.findOne({ where: { id } });
    if (!sede) {
      throw new NotFoundException(`Sede con ID ${id} no encontrada`);
    }

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
    const sede = await this.sedeRepository.findOne({
      where: { id },
      relations: { imagenes: true },
    });
    if (!sede) {
      throw new NotFoundException(`Sede con ID ${id} no encontrada`);
    }

    // Borrar archivos físicos antes de eliminar la fila (cascade elimina registros)
    for (const img of sede.imagenes ?? []) {
      await this.images.remove('sedes', img.archivo);
    }
    await this.sedeRepository.remove(sede);
  }

  // ─────────────────────────────────────────────
  // IMÁGENES
  // ─────────────────────────────────────────────

  async addImagen(
    sedeId: number,
    file: ArchivoSubido | undefined,
  ): Promise<SedeImagenDto> {
    const sede = await this.sedeRepository.findOne({
      where: { id: sedeId },
      relations: { imagenes: true },
    });
    if (!sede) {
      throw new NotFoundException(`Sede con ID ${sedeId} no encontrada`);
    }

    const archivo = await this.images.save('sedes', file);

    const ultimoOrden =
      sede.imagenes?.reduce((max, img) => Math.max(max, img.orden), -1) ?? -1;

    const imagen = this.sedeImagenRepository.create({
      archivo,
      orden: ultimoOrden + 1,
      sedeId,
    });
    const guardada = await this.sedeImagenRepository.save(imagen);

    return {
      id: guardada.id,
      orden: guardada.orden,
      url: `/api/sedes/${sedeId}/imagenes/${guardada.id}`,
    };
  }

  async getImagenPath(sedeId: number, imagenId: number): Promise<string> {
    const imagen = await this.sedeImagenRepository.findOne({
      where: { id: imagenId, sedeId },
    });
    if (!imagen) {
      throw new NotFoundException(
        `Imagen con ID ${imagenId} no encontrada en la sede ${sedeId}`,
      );
    }
    return this.images.pathOf('sedes', imagen.archivo);
  }

  async removeImagen(sedeId: number, imagenId: number): Promise<void> {
    const imagen = await this.sedeImagenRepository.findOne({
      where: { id: imagenId, sedeId },
    });
    if (!imagen) {
      throw new NotFoundException(
        `Imagen con ID ${imagenId} no encontrada en la sede ${sedeId}`,
      );
    }
    await this.sedeImagenRepository.remove(imagen);
    await this.images.remove('sedes', imagen.archivo);
  }

  /** Transforma la entity al DTO que consume el frontend (con url ya armada) */
  private toDto(sede: Sede): SedeConImagenes {
    const { imagenes, ...rest } = sede;
    return {
      ...rest,
      imagenes: (imagenes ?? []).map((img) => ({
        id: img.id,
        orden: img.orden,
        url: `/api/sedes/${sede.id}/imagenes/${img.id}`,
      })),
    };
  }
}