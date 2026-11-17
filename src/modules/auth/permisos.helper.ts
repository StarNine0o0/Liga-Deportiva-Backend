import { ForbiddenException } from '@nestjs/common';
import { Rol } from './roles.enum.js';

export interface UserJwt {
  id: number;
  email: string;
  rol: string;
  equipoId: number | null;
}

export const esAdmin = (u: UserJwt) => u.rol === Rol.ADMIN;
export const esDeEquipo = (u: UserJwt) =>
  u.rol === Rol.CAPITAN || u.rol === Rol.ENTRENADOR;

/** Admin pasa siempre; capitán/entrenador solo si el equipo es el suyo. */
export function verificarEquipo(u: UserJwt, equipoId: number) {
  if (esAdmin(u)) return;
  if (esDeEquipo(u) && u.equipoId === equipoId) return;
  throw new ForbiddenException('Solo puedes modificar información de tu equipo');
}

/** Admin pasa siempre; árbitro solo si el partido es suyo. */
export function verificarArbitro(u: UserJwt, arbitroId: number) {
  if (esAdmin(u)) return;
  if (u.rol === Rol.ARBITRO && u.id === arbitroId) return;
  throw new ForbiddenException('Solo puedes modificar tus partidos');
}