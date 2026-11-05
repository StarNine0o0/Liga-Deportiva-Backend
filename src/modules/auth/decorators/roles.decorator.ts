import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorador para especificar qué roles pueden acceder a una ruta.
 * Uso: @Roles('admin') o @Roles('admin', 'arbitro')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

