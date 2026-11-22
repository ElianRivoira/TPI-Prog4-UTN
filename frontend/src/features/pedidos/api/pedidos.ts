import { api } from '@/shared/api/axiosInstance';

import type { FiltrosPedidos, Pedido, PedidoCreate, PedidosPaginados } from '../types/pedido.types';

/**
 * POST /pedidos: crea el pedido y descuenta el stock en una sola transacción (RN-01).
 * 400 si falta stock o el producto no está disponible; 404 si el producto no existe.
 */
export async function crearPedido(datos: PedidoCreate): Promise<Pedido> {
  const { data } = await api.post<Pedido>('/pedidos', datos);
  return data;
}

/** GET /pedidos: los propios para un user, todos para un admin (RN-04). Más recientes primero. */
export async function listarPedidos(filtros: FiltrosPedidos): Promise<PedidosPaginados> {
  const { data } = await api.get<PedidosPaginados>('/pedidos', { params: filtros });
  return data;
}

/** GET /pedidos/{id}: detalle con sus líneas. 403 si es ajeno, 404 si no existe. */
export async function obtenerPedido(id: number): Promise<Pedido> {
  const { data } = await api.get<Pedido>(`/pedidos/${id}`);
  return data;
}

/** PATCH /pedidos/{id}/cancelar: el dueño cancela un pedido PENDIENTE y se restituye el stock (RN-03). */
export async function cancelarPedido(id: number): Promise<Pedido> {
  const { data } = await api.patch<Pedido>(`/pedidos/${id}/cancelar`);
  return data;
}
