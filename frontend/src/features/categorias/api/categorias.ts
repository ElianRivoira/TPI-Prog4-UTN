import { api } from '@/shared/api/axiosInstance';

import type { Categoria, CategoriaCreate, CategoriaUpdate } from '../types/categoria.types';

/** GET /categorias: categorías activas (público). */
export async function listarCategorias(): Promise<Categoria[]> {
  const { data } = await api.get<Categoria[]>('/categorias');
  return data;
}

/** POST /categorias (admin): 409 si el nombre ya existe. */
export async function crearCategoria(datos: CategoriaCreate): Promise<Categoria> {
  const { data } = await api.post<Categoria>('/categorias', datos);
  return data;
}

/** PUT /categorias/{id} (admin): 404 si no existe o está dada de baja; 409 si el nombre ya existe. */
export async function actualizarCategoria(id: number, datos: CategoriaUpdate): Promise<Categoria> {
  const { data } = await api.put<Categoria>(`/categorias/${id}`, datos);
  return data;
}

/** DELETE /categorias/{id} (admin): baja lógica, responde 204 sin cuerpo. */
export async function eliminarCategoria(id: number): Promise<void> {
  await api.delete(`/categorias/${id}`);
}
