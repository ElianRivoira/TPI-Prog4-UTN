import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useCartStore } from '@/store/cartStore';
import { EstadoVacio } from '@/shared/components/EstadoVacio';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Modal } from '@/shared/ui/Modal';
import { formatearPrecio } from '@/shared/utils/formato';

import { ItemCarritoFila } from '../components/ItemCarritoFila';

export function CarritoPage() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total());
  const vaciar = useCartStore((s) => s.vaciar);
  const navigate = useNavigate();
  const [confirmandoVaciar, setConfirmandoVaciar] = useState(false);

  if (items.length === 0) {
    return (
      <EstadoVacio
        titulo="Tu carrito está vacío"
        mensaje="Agregá productos desde el catálogo."
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
      <h1 className="text-2xl font-bold text-slate-900">Carrito</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <Card className="py-0">
          <ul className="divide-y divide-slate-100">
            {items.map((item) => (
              <ItemCarritoFila key={item.producto_id} item={item} />
            ))}
          </ul>
        </Card>

        <Card className="flex h-fit flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Total</span>
            <span className="text-xl font-bold text-slate-900">{formatearPrecio(total)}</span>
          </div>
          <p className="text-xs text-slate-500">
            El precio y el stock se confirman al crear el pedido.
          </p>
          {/* /checkout pide sesión: sin ella, ProtectedRoute lleva al login y después vuelve acá */}
          <Button onClick={() => navigate('/checkout')}>Confirmar pedido</Button>
          <Button variante="fantasma" onClick={() => setConfirmandoVaciar(true)}>
            Vaciar carrito
          </Button>
        </Card>
      </div>

      <Modal
        abierto={confirmandoVaciar}
        titulo="Vaciar carrito"
        onCerrar={() => setConfirmandoVaciar(false)}
      >
        <p className="text-sm text-slate-600">Se van a quitar todos los productos del carrito.</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variante="secundario" onClick={() => setConfirmandoVaciar(false)}>
            Cancelar
          </Button>
          <Button
            variante="peligro"
            onClick={() => {
              vaciar();
              setConfirmandoVaciar(false);
            }}
          >
            Vaciar
          </Button>
        </div>
      </Modal>
    </section>
  );
}
