import { api } from '@/shared/api/axiosInstance';

import type {
  FiltrosProductos,
  Producto,
  ProductoCreate,
  ProductosPaginados,
  ProductoStockUpdate,
  ProductoUpdate,
} from '../types/producto.types';

/** GET /productos: productos activos, paginados en el servidor (público). */
export async function listarProductos(filtros: FiltrosProductos): Promise<ProductosPaginados> {
  const { data } = await api.get<ProductosPaginados>('/productos', { params: filtros });
  return data;
}

/** POST /productos (admin): 404 si la categoría no existe o está dada de baja. */
export async function crearProducto(datos: ProductoCreate): Promise<Producto> {
  const { data } = await api.post<Producto>('/productos', datos);
  return data;
}

/** PUT /productos/{id} (admin): 404 si el producto o la categoría nueva no existen. */
export async function actualizarProducto(id: number, datos: ProductoUpdate): Promise<Producto> {
  const { data } = await api.put<Producto>(`/productos/${id}`, datos);
  return data;
}

/** PATCH /productos/{id}/stock (admin): fija el stock y la disponibilidad. */
export async function actualizarStock(id: number, datos: ProductoStockUpdate): Promise<Producto> {
  const { data } = await api.patch<Producto>(`/productos/${id}/stock`, datos);
  return data;
}

/** DELETE /productos/{id} (admin): baja lógica, responde 204 sin cuerpo. */
export async function eliminarProducto(id: number): Promise<void> {
  await api.delete(`/productos/${id}`);
}
