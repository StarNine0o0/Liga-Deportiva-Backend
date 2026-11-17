import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  ROLES_KEY,
  ADMIN_ESCRIBE_KEY,
} from '../decorators/roles.decorator.js';

/**
 * Guard global de roles.
 * - @Roles('a', 'b'): solo esos roles.
 * - @AdminEscribe() en la clase: GET libre, el resto solo admin.
 * - Sin ninguno de los dos: acceso libre (para usuarios autenticados).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const destinos = [context.getHandler(), context.getClass()];
    const request = context.switchToHttp().getRequest();
    const { user } = request;

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      destinos,
    );

    let permitidos: string[] | null =
      requiredRoles && requiredRoles.length > 0 ? requiredRoles : null;

    if (!permitidos) {
      const adminEscribe = this.reflector.getAllAndOverride<boolean>(
        ADMIN_ESCRIBE_KEY,
        destinos,
      );
      const esLectura = ['GET', 'HEAD', 'OPTIONS'].includes(request.method);
      if (adminEscribe && !esLectura) {
        permitidos = ['admin'];
      }
    }

    // Si no se especifican restricciones, permitir acceso
    if (!permitidos) {
      return true;
    }

    if (!user || !permitidos.includes(user.rol)) {
      throw new ForbiddenException(
        'No tienes permisos para acceder a este recurso',
      );
    }

    return true;
  }
}