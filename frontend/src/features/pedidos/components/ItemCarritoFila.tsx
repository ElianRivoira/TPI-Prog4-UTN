import type { ItemCarrito } from '@/store/cartStore';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/shared/ui/Button';
import { formatearPrecio } from '@/shared/utils/formato';

const CANTIDAD_MAXIMA = 99;

export function ItemCarritoFila({ item }: { item: ItemCarrito }) {
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad);
  const quitar = useCartStore((s) => s.quitar);

  const subtotal = Math.round(item.precio_unitario * item.cantidad * 100) / 100;

  return (
    <li className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex-1">
        <p className="font-medium text-slate-900">{item.nombre}</p>
        <p className="text-sm text-slate-500">{formatearPrecio(item.precio_unitario)} c/u</p>
      </div>

      <div className="flex items-center gap-2" aria-label={`Cantidad de ${item.nombre}`}>
        <Button
          variante="secundario"
          tamano="sm"
          aria-label="Restar uno"
          disabled={item.cantidad <= 1}
          onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
        >
          −
        </Button>
        <input
          type="number"
          inputMode="numeric"
          min={1}
          max={CANTIDAD_MAXIMA}
          aria-label="Cantidad"
          value={item.cantidad}
          onChange={(e) => {
            const valor = Number(e.target.value);
            if (Number.isInteger(valor) && valor >= 1 && valor <= CANTIDAD_MAXIMA) {
              cambiarCantidad(item.producto_id, valor);
            }
          }}
          className="w-14 rounded-lg border border-slate-300 px-2 py-1.5 text-center text-sm"
        />
        <Button
          variante="secundario"
          tamano="sm"
          aria-label="Sumar uno"
          disabled={item.cantidad >= CANTIDAD_MAXIMA}
          onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
        >
          +
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4 sm:w-48 sm:justify-end">
        <span className="font-semibold text-slate-900">{formatearPrecio(subtotal)}</span>
        <Button variante="fantasma" tamano="sm" onClick={() => quitar(item.producto_id)}>
          Quitar
        </Button>
      </div>
    </li>
  );
}
