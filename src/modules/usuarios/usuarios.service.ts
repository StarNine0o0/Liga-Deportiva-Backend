import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './entities/usuario.entity.js';
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';
import { RolesService } from '../roles/roles.service.js';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly rolesService: RolesService,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    // Verificar que el rol existe
    const rol = await this.rolesService.findOne(createUsuarioDto.rolId);
    if (!rol) {
      throw new BadRequestException(
        `Rol con ID ${createUsuarioDto.rolId} no existe`,
      );
    }

    // Verificar email único
    const existeEmail = await this.usuarioRepository.findOne({
      where: { email: createUsuarioDto.email },
    });
    if (existeEmail) {
      throw new ConflictException(
        `El email "${createUsuarioDto.email}" ya está registrado`,
      );
    }

    // Hash del password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUsuarioDto.password, salt);

    const usuario = this.usuarioRepository.create({
      ...createUsuarioDto,
      password: hashedPassword,
    });

    const saved = await this.usuarioRepository.save(usuario);

    // Retornar sin password
    const { password: _, ...result } = saved as any;
    return result;
  }

  async findAll(): Promise<Usuario[]> {
    return this.usuarioRepository.find({
      relations: { rol: true },
    });
  }

  async findOne(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: { rol: true },
    });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return usuario;
  }

  /**
   * Busca un usuario por email incluyendo el password (para autenticación).
   */
  async findByEmail(email: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({
      where: { email },
      select: {
        id: true,
        nombre: true,
        email: true,
        password: true,
        activo: true,
        rolId: true,
      },
      relations: { rol: true },
    });
  }

  async update(
    id: number,
    updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<Usuario> {
    const usuario = await this.findOne(id);

    // Si cambia el rol, verificar que existe
    if (updateUsuarioDto.rolId) {
      await this.rolesService.findOne(updateUsuarioDto.rolId);
    }

    // Si cambia el email, verificar que no esté duplicado
    if (updateUsuarioDto.email && updateUsuarioDto.email !== usuario.email) {
      const existeEmail = await this.usuarioRepository.findOne({
        where: { email: updateUsuarioDto.email },
      });
      if (existeEmail) {
        throw new ConflictException(
          `El email "${updateUsuarioDto.email}" ya está registrado`,
        );
      }
    }

    Object.assign(usuario, updateUsuarioDto);
    return this.usuarioRepository.save(usuario);
  }

  async remove(id: number): Promise<void> {
    const usuario = await this.findOne(id);
    await this.usuarioRepository.remove(usuario);
  }
}

