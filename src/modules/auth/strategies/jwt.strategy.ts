import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsuariosService } from '../../usuarios/usuarios.service.js';

export interface JwtPayload {
  sub: number;
  email: string;
  rol: string;
  equipoId?: number | null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usuariosService: UsuariosService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET no está definido en las variables de entorno');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    // Invitado: token firmado por el servidor, sin usuario en BD
    if (payload.rol === 'invitado') {
      return { id: 0, email: 'invitado', rol: 'invitado', equipoId: null };
    }

    const usuario = await this.usuariosService.findOne(payload.sub);
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Usuario inactivo o no encontrado');
    }

    return {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol?.nombre ?? payload.rol,
      equipoId: usuario.equipoId ?? null,
    };
  }
}