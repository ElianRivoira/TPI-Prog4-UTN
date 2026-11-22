import { BadgeEstado } from '@/shared/ui/BadgeEstado';
import { formatearFecha, formatearPrecio } from '@/shared/utils/formato';

import type { FormaPago, Pedido } from '../types/pedido.types';

const ETIQUETA_PAGO: Record<FormaPago, string> = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
};

/** Datos de entrega y líneas del pedido con el precio copiado al comprar (RN-05). */
export function DetallePedido({ pedido }: { pedido: Pedido }) {
  return (
    <div className="flex flex-col gap-4 text-sm">
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
        <dt className="text-slate-500">Estado</dt>
        <dd>
          <BadgeEstado estado={pedido.estado} />
        </dd>
        <dt className="text-slate-500">Fecha</dt>
        <dd className="text-slate-800">{formatearFecha(pedido.created_at)}</dd>
        <dt className="text-slate-500">Entrega</dt>
        <dd className="break-words text-slate-800">{pedido.direccion_entrega}</dd>
        <dt className="text-slate-500">Pago</dt>
        <dd className="text-slate-800">{ETIQUETA_PAGO[pedido.forma_pago]}</dd>
        {pedido.notas && (
          <>
            <dt className="text-slate-500">Notas</dt>
            <dd className="whitespace-pre-line break-words text-slate-800">{pedido.notas}</dd>
          </>
        )}
      </dl>

      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
            <th className="py-2 font-medium">Producto</th>
            <th className="py-2 text-right font-medium">Cant.</th>
            <th className="hidden py-2 text-right font-medium sm:table-cell">Precio</th>
            <th className="py-2 text-right font-medium">Subtotal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {pedido.items.map((item) => (
            <tr key={item.producto_id}>
              <td className="py-2 text-slate-800">{item.nombre_producto}</td>
              <td className="py-2 text-right text-slate-800">{item.cantidad}</td>
              <td className="hidden py-2 text-right text-slate-600 sm:table-cell">
                {formatearPrecio(item.precio_unitario)}
              </td>
              <td className="py-2 text-right font-medium text-slate-900">
                {formatearPrecio(item.subtotal)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-slate-200">
            <td colSpan={2} className="py-2 font-semibold text-slate-900 sm:hidden">
              Total
            </td>
            <td colSpan={3} className="hidden py-2 font-semibold text-slate-900 sm:table-cell">
              Total
            </td>
            <td className="py-2 text-right text-base font-bold text-slate-900">
              {formatearPrecio(pedido.total)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
