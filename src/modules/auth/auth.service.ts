import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtPayload } from './strategies/jwt.strategy.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const usuario = await this.usuariosService.findByEmail(loginDto.email);

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!usuario.activo) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const passwordValido = await bcrypt.compare(
      loginDto.password,
      usuario.password,
    );
    if (!passwordValido) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload: JwtPayload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol?.nombre ?? 'sin_rol',
      equipoId: usuario.equipoId ?? null,
    };

    const secret = this.configService.get<string>('JWT_SECRET');

    return {
      access_token: this.jwtService.sign(payload, { secret }),
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol?.nombre,
        equipoId: usuario.equipoId ?? null,
      },
    };
  }

  /** Sesión de solo lectura, sin usuario en BD. */
  invitado() {
    const payload: JwtPayload = {
      sub: 0,
      email: 'invitado',
      rol: 'invitado',
      equipoId: null,
    };
    const secret = this.configService.get<string>('JWT_SECRET');

    return {
      access_token: this.jwtService.sign(payload, { secret }),
      usuario: {
        id: 0,
        nombre: 'Invitado',
        email: 'invitado',
        rol: 'invitado',
        equipoId: null,
      },
    };
  }

  async getProfile(userId: number) {
    if (userId === 0) {
      return { id: 0, nombre: 'Invitado', email: 'invitado', rol: 'invitado' };
    }
    return this.usuariosService.findOne(userId);
  }
}