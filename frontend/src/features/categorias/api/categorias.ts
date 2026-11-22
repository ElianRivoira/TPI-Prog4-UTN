import { api } from '@/shared/api/axiosInstance';

import type { Categoria } from '../types/categoria.types';

/** GET /categorias: categorías activas (público). */
export async function listarCategorias(): Promise<Categoria[]> {
  const { data } = await api.get<Categoria[]>('/categorias');
  return data;
}
