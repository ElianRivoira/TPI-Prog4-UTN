import { api } from '@/shared/api/axiosInstance';

import type { Usuario } from '../types/usuario.types';

/** GET /admin/usuarios (admin): todos los usuarios, activos y desactivados. */
export async function listarUsuarios(): Promise<Usuario[]> {
  const { data } = await api.get<Usuario[]>('/admin/usuarios');
  return data;
}

/** POST /admin/usuarios/{id}/activar (admin): alta lógica. 404 si no existe. */
export async function activarUsuario(id: number): Promise<Usuario> {
  const { data } = await api.post<Usuario>(`/admin/usuarios/${id}/activar`);
  return data;
}

/** POST /admin/usuarios/{id}/desactivar (admin): baja lógica. 400 si el admin intenta desactivarse a sí mismo. */
export async function desactivarUsuario(id: number): Promise<Usuario> {
  const { data } = await api.post<Usuario>(`/admin/usuarios/${id}/desactivar`);
  return data;
}
