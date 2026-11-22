import { useCartStore } from '@/store/cartStore';
import { Button } from '@/shared/ui/Button';
import { formatearPrecio } from '@/shared/utils/formato';

import type { Producto } from '../types/producto.types';
import { ImagenProducto } from './ImagenProducto';

const POCO_STOCK = 5;

export function ProductoCard({ producto }: { producto: Producto }) {
  const agregar = useCartStore((s) => s.agregar);
  const enCarrito = useCartStore(
    (s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0,
  );

  const sinStock = producto.stock === 0;
  // No se deja sumar más de lo que hay; el backend lo vuelve a validar al crear el pedido (RN-01)
  const topeAlcanzado = enCarrito >= producto.stock;

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <ImagenProducto url={producto.imagen_url} nombre={producto.nombre} className="h-40 w-full" />

      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-orange-600">
          {producto.categoria.nombre}
        </span>
        <h2 className="font-semibold text-slate-900">{producto.nombre}</h2>
        {producto.descripcion && (
          <p className="line-clamp-2 text-sm text-slate-500">{producto.descripcion}</p>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <span className="text-lg font-bold text-slate-900">
            {formatearPrecio(producto.precio_base)}
          </span>
          <span className="text-xs text-slate-500">
            {sinStock
              ? 'Sin stock'
              : producto.stock <= POCO_STOCK
                ? `¡Quedan ${producto.stock}!`
                : `Stock: ${producto.stock}`}
          </span>
        </div>

        <Button
          disabled={sinStock || topeAlcanzado}
          onClick={() =>
            agregar({
              producto_id: producto.id,
              nombre: producto.nombre,
              precio_unitario: producto.precio_base,
            })
          }
        >
          {sinStock ? 'Sin stock' : 'Agregar al carrito'}
        </Button>
        {enCarrito > 0 && (
          <p className="text-center text-xs text-slate-500">
            En el carrito: {enCarrito}
            {topeAlcanzado && ' (máximo disponible)'}
          </p>
        )}
      </div>
    </article>
  );
}
