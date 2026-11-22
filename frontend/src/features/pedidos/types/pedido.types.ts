/** Estados de la máquina de estados del pedido (EstadoPedido en el backend). */
export type EstadoPedido = 'PENDIENTE' | 'EN_PREPARACION' | 'ENTREGADO' | 'CANCELADO';

/** FormaPago en el backend: pago manual, sin pasarela. */
export type FormaPago = 'EFECTIVO' | 'TRANSFERENCIA';

/** DetallePedidoRead: copia del nombre y del precio al momento de la compra (RN-05). */
export interface DetallePedido {
  producto_id: number;
  nombre_producto: string;
  precio_unitario: number;
  cantidad: number;
  subtotal: number;
}

/** PedidoRead en el backend. */
export interface Pedido {
  id: number;
  usuario_id: number;
  estado: EstadoPedido;
  forma_pago: FormaPago;
  direccion_entrega: string;
  notas: string | null;
  total: number;
  created_at: string;
  updated_at: string;
  items: DetallePedido[];
}

/** PedidosPaginados en el backend. */
export interface PedidosPaginados {
  total: number;
  items: Pedido[];
}

/** PedidoCreate: solo productos y cantidades; el precio lo toma el backend. */
export interface PedidoCreate {
  items: Array<{ producto_id: number; cantidad: number }>;
  forma_pago: FormaPago;
  direccion_entrega: string;
  notas: string | null;
}

/** Parámetros de GET /pedidos. */
export interface FiltrosPedidos {
  skip: number;
  limit: number;
  estado?: EstadoPedido;
}
