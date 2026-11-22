import type { EstadoPedido } from '../types/pedido.types';

/**
 * Copia de la máquina de estados del backend (RN-02), solo para decidir qué botones mostrar.
 * Quien valida la transición es siempre el backend (responde 400 si no es válida).
 */
const SIGUIENTE: Partial<Record<EstadoPedido, { estado: EstadoPedido; accion: string }>> = {
  PENDIENTE: { estado: 'EN_PREPARACION', accion: 'Preparar' },
  EN_PREPARACION: { estado: 'ENTREGADO', accion: 'Entregar' },
};

/** Estado al que avanza un pedido, o undefined si no puede avanzar. */
export function siguienteEstado(estado: EstadoPedido) {
  return SIGUIENTE[estado];
}

/** El admin cancela desde cualquier estado no terminal (RN-03). */
export function esCancelablePorAdmin(estado: EstadoPedido): boolean {
  return estado === 'PENDIENTE' || estado === 'EN_PREPARACION';
}

export const ESTADOS_PEDIDO: Array<{ valor: EstadoPedido; etiqueta: string }> = [
  { valor: 'PENDIENTE', etiqueta: 'Pendientes' },
  { valor: 'EN_PREPARACION', etiqueta: 'En preparación' },
  { valor: 'ENTREGADO', etiqueta: 'Entregados' },
  { valor: 'CANCELADO', etiqueta: 'Cancelados' },
];
