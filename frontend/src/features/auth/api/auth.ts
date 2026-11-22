import { api } from '@/shared/api/axiosInstance';

import type { Usuario } from '../types/auth.types';

/**
 * POST /auth/token. El backend espera un formulario OAuth2 (no JSON) y responde con la cookie
 * HttpOnly access_token; el token no viaja en el cuerpo de la respuesta.
 */
export async function iniciarSesion(username: string, password: string): Promise<void> {
  await api.post('/auth/token', new URLSearchParams({ username, password }));
}

/** GET /auth/me: 401 sin sesión válida, 400 si la cuenta está desactivada. */
export async function obtenerUsuarioActual(): Promise<Usuario> {
  const { data } = await api.get<Usuario>('/auth/me');
  return data;
}

/** POST /auth/logout: el servidor borra la cookie. */
export async function cerrarSesion(): Promise<void> {
  await api.post('/auth/logout');
}
