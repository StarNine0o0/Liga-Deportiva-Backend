import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorador para marcar una ruta como pública (sin autenticación JWT).
 * Usar en controladores o métodos: @Public()
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

