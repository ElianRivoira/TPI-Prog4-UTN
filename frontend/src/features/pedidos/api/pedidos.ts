import { api } from '@/shared/api/axiosInstance';

import type { Pedido, PedidoCreate } from '../types/pedido.types';

/**
 * POST /pedidos: crea el pedido y descuenta el stock en una sola transacción (RN-01).
 * 400 si falta stock o el producto no está disponible; 404 si el producto no existe.
 */
export async function crearPedido(datos: PedidoCreate): Promise<Pedido> {
  const { data } = await api.post<Pedido>('/pedidos', datos);
  return data;
}
