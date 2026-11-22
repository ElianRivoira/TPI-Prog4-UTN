import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface ItemCarrito {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
}

type ProductoParaCarrito = Omit<ItemCarrito, 'cantidad'>;

interface CartState {
  items: ItemCarrito[];
  agregar: (producto: ProductoParaCarrito, cantidad?: number) => void;
  quitar: (productoId: number) => void;
  cambiarCantidad: (productoId: number, cantidad: number) => void;
  vaciar: () => void;
  total: () => number;
  cantidadItems: () => number;
}

/** Redondea a centavos para evitar errores de coma flotante al sumar precios. */
const aCentavos = (monto: number) => Math.round(monto * 100) / 100;

/**
 * Carrito del cliente. Persiste en localStorage: no tiene datos sensibles y así sobrevive a la
 * recarga y al cierre del navegador. El precio guardado es orientativo: el backend toma el precio
 * y valida el stock al crear el pedido (RN-01, RN-05).
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (producto, cantidad = 1) => {
        if (!Number.isInteger(cantidad) || cantidad < 1) return;
        set((state) => {
          const existente = state.items.find((i) => i.producto_id === producto.producto_id);
          if (existente) {
            return {
              items: state.items.map((i) =>
                i.producto_id === producto.producto_id ? { ...i, cantidad: i.cantidad + cantidad } : i,
              ),
            };
          }
          return { items: [...state.items, { ...producto, cantidad }] };
        });
      },

      quitar: (productoId) =>
        set((state) => ({ items: state.items.filter((i) => i.producto_id !== productoId) })),

      cambiarCantidad: (productoId, cantidad) => {
        // La cantidad mínima es 1; para sacar el producto se usa quitar
        if (!Number.isInteger(cantidad) || cantidad < 1) return;
        set((state) => ({
          items: state.items.map((i) => (i.producto_id === productoId ? { ...i, cantidad } : i)),
        }));
      },

      vaciar: () => set({ items: [] }),

      total: () => aCentavos(get().items.reduce((suma, i) => suma + i.precio_unitario * i.cantidad, 0)),

      cantidadItems: () => get().items.reduce((suma, i) => suma + i.cantidad, 0),
    }),
    {
      name: 'food-store-carrito',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
