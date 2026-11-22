import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useCartStore } from '@/store/cartStore';
import { handleApiError } from '@/shared/api/handleApiError';
import { EstadoVacio } from '@/shared/components/EstadoVacio';
import { Card } from '@/shared/ui/Card';
import { formatearPrecio } from '@/shared/utils/formato';

import { CheckoutForm, type DatosCheckout } from '../components/CheckoutForm';
import { useCrearPedido } from '../hooks/usePedidos';

export function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total());
  const vaciar = useCartStore((s) => s.vaciar);
  const crearPedido = useCrearPedido();
  const navigate = useNavigate();
  const [errorApi, setErrorApi] = useState<string | null>(null);

  async function confirmar(datos: DatosCheckout) {
    setErrorApi(null);
    try {
      const pedido = await crearPedido.mutateAsync({
        items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
        forma_pago: datos.forma_pago,
        direccion_entrega: datos.direccion_entrega.trim(),
        notas: datos.notas.trim() || null,
      });
      navigate('/mis-pedidos', { replace: true, state: { pedidoCreado: pedido.id } });
      vaciar();
    } catch (error) {
      // 400 «Stock insuficiente…» o producto no disponible: el carrito se conserva para corregirlo
      setErrorApi(handleApiError(error));
    }
  }

  if (items.length === 0) {
    return (
      <EstadoVacio
        titulo="No hay productos para confirmar"
        mensaje="Agregá productos al carrito antes de confirmar el pedido."
        accion={
          <Link to="/" className="text-sm font-medium text-orange-600 hover:text-orange-700">
            Ir al catálogo
          </Link>
        }
      />
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900">Confirmar pedido</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <Card className="p-6">
          <CheckoutForm onConfirmar={confirmar} errorApi={errorApi} />
        </Card>

        <Card className="flex h-fit flex-col gap-3">
          <h2 className="font-semibold text-slate-900">Resumen</h2>
          <ul className="divide-y divide-slate-100 text-sm">
            {items.map((i) => (
              <li key={i.producto_id} className="flex justify-between gap-2 py-2">
                <span className="text-slate-700">
                  {i.cantidad} × {i.nombre}
                </span>
                <span className="font-medium text-slate-900">
                  {formatearPrecio(i.precio_unitario * i.cantidad)}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t border-slate-200 pt-3">
            <span className="text-slate-600">Total</span>
            <span className="text-lg font-bold text-slate-900">{formatearPrecio(total)}</span>
          </div>
          <Link to="/carrito" className="text-sm font-medium text-orange-600 hover:text-orange-700">
            Modificar carrito
          </Link>
        </Card>
      </div>
    </section>
  );
}
