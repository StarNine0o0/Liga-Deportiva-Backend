import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Jugador } from './entities/jugadores.entity.js';
import { CreateJugadorDto } from './dto/create-jugadore.dto.js';
import { UpdateJugadorDto } from './dto/update-jugadore.dto.js';
import { EquiposService } from '../equipos/equipos.service.js';
import { ImageStorageService } from '../../common/uploads/image-storage.service.js';
import type { ArchivoSubido } from '../../common/uploads/image-storage.service.js';
import {
  UserJwt,
  esDeEquipo,
  verificarEquipo,
} from '../auth/permisos.helper.js';

@Injectable()
export class JugadoresService {
  constructor(
    @InjectRepository(Jugador)
    private readonly jugadorRepository: Repository<Jugador>,
    private readonly equiposService: EquiposService,
    private readonly images: ImageStorageService,
  ) {}

  /** Capitán y entrenador solo pueden ver jugadores de su equipo */
  private soloSuEquipo(user: UserJwt | undefined, equipoId: number) {
    if (user && esDeEquipo(user) && user.equipoId !== equipoId) {
      throw new ForbiddenException('Solo puedes ver jugadores de tu equipo');
    }
  }

  // `user` es opcional para llamadas internas de otros services;
  // los controllers siempre lo mandan.
  async create(dto: CreateJugadorDto, user?: UserJwt): Promise<Jugador> {
    if (user) verificarEquipo(user, dto.equipoId);

    // Lanza 404 si el equipo no existe
    await this.equiposService.findOne(dto.equipoId);
    await this.verificarCamiseta(dto.equipoId, dto.numeroCamiseta);

    const jugador = this.jugadorRepository.create(dto);
    return this.jugadorRepository.save(jugador);
  }

  async countByEquipo(equipoId: number): Promise<number> {
    return this.jugadorRepository.count({ where: { equipoId } });
  }

  async findAll(user?: UserJwt): Promise<Jugador[]> {
    if (user && esDeEquipo(user)) {
      return this.jugadorRepository.find({
        where: { equipoId: user.equipoId ?? -1 },
        relations: { equipo: true },
      });
    }
    return this.jugadorRepository.find({ relations: { equipo: true } });
  }

  async findByEquipo(equipoId: number, user?: UserJwt): Promise<Jugador[]> {
    this.soloSuEquipo(user, equipoId);
    return this.jugadorRepository.find({
      where: { equipoId },
      relations: { equipo: true },
    });
  }

  async findOne(id: number, user?: UserJwt): Promise<Jugador> {
    const jugador = await this.jugadorRepository.findOne({
      where: { id },
      relations: { equipo: true },
    });
    if (!jugador) {
      throw new NotFoundException(`Jugador con ID ${id} no encontrado`);
    }
    this.soloSuEquipo(user, jugador.equipoId);
    return jugador;
  }

  async update(
    id: number,
    dto: UpdateJugadorDto,
    user?: UserJwt,
  ): Promise<Jugador> {
    const jugador = await this.findOne(id);

    if (user) {
      verificarEquipo(user, jugador.equipoId); // el jugador actual es de su equipo
      if (dto.equipoId) verificarEquipo(user, dto.equipoId); // y no lo mueve a otro
    }

    if (dto.equipoId) {
      await this.equiposService.findOne(dto.equipoId);
    }

    const equipoId = dto.equipoId ?? jugador.equipoId;
    const numero = dto.numeroCamiseta ?? jugador.numeroCamiseta;
    if (equipoId !== jugador.equipoId || numero !== jugador.numeroCamiseta) {
      await this.verificarCamiseta(equipoId, numero);
    }

    Object.assign(jugador, dto);
    return this.jugadorRepository.save(jugador);
  }

  async remove(id: number, user?: UserJwt): Promise<void> {
    const jugador = await this.findOne(id);
    if (user) verificarEquipo(user, jugador.equipoId);

    const foto = jugador.fotoArchivo;
    await this.jugadorRepository.remove(jugador);
    if (foto) await this.images.remove('jugadores', foto);
  }

  async setFoto(
    id: number,
    file: ArchivoSubido | undefined,
    user?: UserJwt,
  ): Promise<Jugador> {
    const jugador = await this.findOne(id);
    if (user) verificarEquipo(user, jugador.equipoId);

    const nueva = await this.images.save('jugadores', file);
    const anterior = jugador.fotoArchivo;
    jugador.fotoArchivo = nueva;
    const guardado = await this.jugadorRepository.save(jugador);
    if (anterior) await this.images.remove('jugadores', anterior);
    return guardado;
  }

  async getFotoPath(id: number, user?: UserJwt): Promise<string> {
    const jugador = await this.findOne(id, user);
    if (!jugador.fotoArchivo) {
      throw new NotFoundException('El jugador no tiene foto');
    }
    return this.images.pathOf('jugadores', jugador.fotoArchivo);
  }

  async removeFoto(id: number, user?: UserJwt): Promise<Jugador> {
    const jugador = await this.findOne(id);
    if (user) verificarEquipo(user, jugador.equipoId);

    const anterior = jugador.fotoArchivo;
    jugador.fotoArchivo = null;
    const guardado = await this.jugadorRepository.save(jugador);
    if (anterior) await this.images.remove('jugadores', anterior);
    return guardado;
  }

  private async verificarCamiseta(equipoId: number, numero: number) {
    const existe = await this.jugadorRepository.findOne({
      where: { equipoId, numeroCamiseta: numero },
    });
    if (existe) {
      throw new ConflictException(
        `El número ${numero} ya lo usa otro jugador de ese equipo`,
      );
    }
  }
}