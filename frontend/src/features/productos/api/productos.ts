import { api } from '@/shared/api/axiosInstance';

import type { FiltrosProductos, ProductosPaginados } from '../types/producto.types';

/** GET /productos: productos activos, paginados en el servidor (público). */
export async function listarProductos(filtros: FiltrosProductos): Promise<ProductosPaginados> {
  const { data } = await api.get<ProductosPaginados>('/productos', { params: filtros });
  return data;
}
