import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gol } from './entities/gol.entity.js';
import { CreateGolDto } from './dto/create-gol.dto.js';
import { UpdateGolDto } from './dto/update-gol.dto.js';
import { EquiposService } from '../equipos/equipos.service.js';
import { PartidosService } from '../partidos/partidos.service.js';
import { LiguillaService } from '../liguilla/liguilla.service.js';
import { UserJwt, verificarArbitro } from '../auth/permisos.helper.js';

@Injectable()
export class GolesService {
  constructor(
    @InjectRepository(Gol)
    private readonly golRepository: Repository<Gol>,
    private readonly equiposService: EquiposService,
    private readonly partidosService: PartidosService,
    private readonly liguillaService: LiguillaService,
  ) {}

  private async verificarPartido(partidoId: number, user?: UserJwt) {
    if (!user) return;
    const partido = await this.partidosService.findOne(partidoId);
    verificarArbitro(user, partido.arbitroId ?? -1);
  }

  /** Recalcula golesLocal y golesVisitante en el partido y despierta el bracket en vivo */
  private async sincronizarPartidoYLiguilla(partidoId: number): Promise<void> {
    const partido = await this.partidosService.findOne(partidoId);
    const golesPartido = await this.golRepository.find({
      where: { partidoId },
    });

    const golesLocal = golesPartido.filter(
      (g) => g.equipoId === partido.equipoLocalId,
    ).length;
    const golesVisitante = golesPartido.filter(
      (g) => g.equipoId === partido.equipoVisitanteId,
    ).length;

    await this.partidosService.sincronizarMarcador(
      partidoId,
      golesLocal,
      golesVisitante,
    );

    if (partido.serieId && partido.jornada?.torneoId) {
      this.liguillaService.notificarCambioBracket(partido.jornada.torneoId);
    }
  }

  async create(createGolDto: CreateGolDto, user?: UserJwt): Promise<Gol> {
    await this.verificarPartido(createGolDto.partidoId, user);
    await this.equiposService.findOne(createGolDto.equipoId);

    const gol = this.golRepository.create(createGolDto);
    const guardado = await this.golRepository.save(gol);
    await this.sincronizarPartidoYLiguilla(guardado.partidoId);
    return guardado;
  }

  async findAll(): Promise<Gol[]> {
    return this.golRepository.find({
      relations: { equipo: true, jugador: true },
    });
  }

  async findOne(id: number): Promise<Gol> {
    const gol = await this.golRepository.findOne({
      where: { id },
      relations: { equipo: true, jugador: true },
    });
    if (!gol) {
      throw new NotFoundException(`Gol con ID ${id} no encontrado`);
    }
    return gol;
  }

  async findByPartido(partidoId: number): Promise<Gol[]> {
    return this.golRepository.find({
      where: { partidoId },
      relations: { equipo: true, jugador: true },
      order: { minuto: 'ASC' },
    });
  }

  async update(
    id: number,
    updateGolDto: UpdateGolDto,
    user?: UserJwt,
  ): Promise<Gol> {
    const gol = await this.findOne(id);
    const partidoAnteriorId = gol.partidoId;

    await this.verificarPartido(gol.partidoId, user);
    if (updateGolDto.partidoId) {
      await this.verificarPartido(updateGolDto.partidoId, user);
    }

    if (updateGolDto.equipoId) {
      await this.equiposService.findOne(updateGolDto.equipoId);
    }

    Object.assign(gol, updateGolDto);
    const actualizado = await this.golRepository.save(gol);

    await this.sincronizarPartidoYLiguilla(actualizado.partidoId);
    if (partidoAnteriorId !== actualizado.partidoId) {
      await this.sincronizarPartidoYLiguilla(partidoAnteriorId);
    }

    return actualizado;
  }

  async remove(id: number, user?: UserJwt): Promise<void> {
    const gol = await this.findOne(id);
    await this.verificarPartido(gol.partidoId, user);
    const partidoId = gol.partidoId;
    await this.golRepository.remove(gol);
    await this.sincronizarPartidoYLiguilla(partidoId);
  }
}