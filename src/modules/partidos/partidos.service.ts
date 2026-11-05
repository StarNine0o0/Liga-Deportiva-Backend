import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Partido } from './entities/partido.entity.js';
import { CreatePartidoDto } from './dto/create-partido.dto.js';
import { UpdatePartidoDto } from './dto/update-partido.dto.js';
import { JornadasService } from '../jornadas/jornadas.service.js';
import { EquiposService } from '../equipos/equipos.service.js';
import { SedesService } from '../sedes/sedes.service.js';

@Injectable()
export class PartidosService {
  constructor(
    @InjectRepository(Partido)
    private readonly partidoRepository: Repository<Partido>,
    private readonly jornadasService: JornadasService,
    private readonly equiposService: EquiposService,
    private readonly sedesService: SedesService,
  ) {}

  async create(dto: CreatePartidoDto): Promise<Partido> {
    if (dto.equipoLocalId === dto.equipoVisitanteId) {
      throw new BadRequestException(
        'El equipo local y el visitante no pueden ser el mismo',
      );
    }

    await this.jornadasService.findOne(dto.jornadaId);
    await this.equiposService.findOne(dto.equipoLocalId);
    await this.equiposService.findOne(dto.equipoVisitanteId);
    if (dto.sedeId) {
      await this.sedesService.findOne(dto.sedeId);
    }

    const partido = this.partidoRepository.create(dto);
    return this.partidoRepository.save(partido);
  }

  async findAll(): Promise<Partido[]> {
    return this.partidoRepository.find({
      relations: {
        jornada: true,
        equipoLocal: true,
        equipoVisitante: true,
        sede: true,
      },
    });
  }

  async findByJornada(jornadaId: number): Promise<Partido[]> {
    return this.partidoRepository.find({
      where: { jornadaId },
      relations: { equipoLocal: true, equipoVisitante: true, sede: true },
      order: { fechaHora: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Partido> {
    const partido = await this.partidoRepository.findOne({
      where: { id },
      relations: {
        jornada: true,
        equipoLocal: true,
        equipoVisitante: true,
        sede: true,
      },
    });
    if (!partido) {
      throw new NotFoundException(`Partido con ID ${id} no encontrado`);
    }
    return partido;
  }

  async update(id: number, dto: UpdatePartidoDto): Promise<Partido> {
    const partido = await this.findOne(id);

    const local = dto.equipoLocalId ?? partido.equipoLocalId;
    const visitante = dto.equipoVisitanteId ?? partido.equipoVisitanteId;
    if (local === visitante) {
      throw new BadRequestException(
        'El equipo local y el visitante no pueden ser el mismo',
      );
    }

    if (dto.jornadaId) await this.jornadasService.findOne(dto.jornadaId);
    if (dto.equipoLocalId) await this.equiposService.findOne(dto.equipoLocalId);
    if (dto.equipoVisitanteId) {
      await this.equiposService.findOne(dto.equipoVisitanteId);
    }
    if (dto.sedeId) await this.sedesService.findOne(dto.sedeId);

    Object.assign(partido, dto);
    return this.partidoRepository.save(partido);
  }

  async remove(id: number): Promise<void> {
    const partido = await this.findOne(id);
    await this.partidoRepository.remove(partido);
  }
}