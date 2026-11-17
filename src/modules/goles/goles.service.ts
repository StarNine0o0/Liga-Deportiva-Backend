import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gol } from './entities/gol.entity.js';
import { CreateGolDto } from './dto/create-gol.dto.js';
import { UpdateGolDto } from './dto/update-gol.dto.js';
import { EquiposService } from '../equipos/equipos.service.js';
import { PartidosService } from '../partidos/partidos.service.js';
import { UserJwt, verificarArbitro } from '../auth/permisos.helper.js';

@Injectable()
export class GolesService {
  constructor(
    @InjectRepository(Gol)
    private readonly golRepository: Repository<Gol>,
    private readonly equiposService: EquiposService,
    private readonly partidosService: PartidosService,
  ) {}

  /** Si viene un usuario, el árbitro solo puede operar en sus partidos */
  private async verificarPartido(partidoId: number, user?: UserJwt) {
    if (!user) return;
    const partido = await this.partidosService.findOne(partidoId);
    verificarArbitro(user, partido.arbitroId ?? -1);
  }

  async create(createGolDto: CreateGolDto, user?: UserJwt): Promise<Gol> {
    await this.verificarPartido(createGolDto.partidoId, user);

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

  async update(
    id: number,
    updateGolDto: UpdateGolDto,
    user?: UserJwt,
  ): Promise<Gol> {
    const gol = await this.findOne(id);

    await this.verificarPartido(gol.partidoId, user);
    if (updateGolDto.partidoId) {
      await this.verificarPartido(updateGolDto.partidoId, user);
    }

    if (updateGolDto.equipoId) {
      await this.equiposService.findOne(updateGolDto.equipoId);
    }

    Object.assign(gol, updateGolDto);
    return this.golRepository.save(gol);
  }

  async remove(id: number, user?: UserJwt): Promise<void> {
    const gol = await this.findOne(id);
    await this.verificarPartido(gol.partidoId, user);
    await this.golRepository.remove(gol);
  }
}