import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const ADMIN_ESCRIBE_KEY = 'adminEscribe';

/**
 * Decorador para especificar qué roles pueden acceder a una ruta.
 * Uso: @Roles('admin') o @Roles('admin', 'arbitro')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

/**
 * A nivel de clase: los GET quedan abiertos a cualquier usuario autenticado
 * y todo lo demás (POST, PATCH, DELETE) solo para admin.
 * Un @Roles(...) en un método tiene prioridad sobre esto.
 */
export const AdminEscribe = () => SetMetadata(ADMIN_ESCRIBE_KEY, true);