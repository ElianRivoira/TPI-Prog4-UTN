import type { Location } from 'react-router-dom';

import type { Rol } from '../types/auth.types';

/**
 * A dónde ir después de iniciar sesión: la pantalla que ProtectedRoute guardó en state.from, o el
 * inicio según el rol.
 */
export function destinoTrasLogin(state: unknown, rol: Rol): string {
  const from = (state as { from?: Partial<Location> } | null)?.from;
  if (from?.pathname && from.pathname !== '/login') {
    return `${from.pathname}${from.search ?? ''}`;
  }
  return rol === 'admin' ? '/admin/resumen' : '/';
}
