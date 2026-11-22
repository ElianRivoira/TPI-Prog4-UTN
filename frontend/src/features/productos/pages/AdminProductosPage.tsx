import { createColumnHelper } from '@tanstack/react-table';
import { useMemo, useState } from 'react';

import { useCategorias } from '@/features/categorias/hooks/useCategorias';
import { handleApiError } from '@/shared/api/handleApiError';
import { EstadoError } from '@/shared/components/EstadoError';
import { TablaDatos, TablaDatosSkeleton } from '@/shared/components/TablaDatos';
import { useTablaCliente } from '@/shared/hooks/useTablaCliente';
import { Alerta } from '@/shared/ui/Alerta';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/ui/cn';
import { Input } from '@/shared/ui/Input';
import { Modal } from '@/shared/ui/Modal';
import { formatearPrecio } from '@/shared/utils/formato';

import { ProductoForm, type DatosProducto } from '../components/ProductoForm';
import { StockForm } from '../components/StockForm';
import {
  useActualizarProducto,
  useActualizarStock,
  useCrearProducto,
  useEliminarProducto,
  useProductos,
} from '../hooks/useProductos';
import type { Producto, ProductoStockUpdate, ProductoUpdate } from '../types/producto.types';

// El panel trae hasta 100 productos (el máximo de la API) y la tabla los pagina en el cliente
const FILTROS_PANEL = { skip: 0, limit: 100 };
const SIN_PRODUCTOS: Producto[] = [];
const columna = createColumnHelper<Producto>();

type Mensaje = { tipo: 'exito' | 'error'; texto: string };

export function AdminProductosPage() {
  const productos = useProductos(FILTROS_PANEL);
  const categorias = useCategorias();
  const crear = useCrearProducto();
  const actualizar = useActualizarProducto();
  const actualizarStock = useActualizarStock();
  const eliminar = useEliminarProducto();

  /** 'nuevo' abre el formulario vacío; un producto lo abre para editarlo. */
  const [enFormulario, setEnFormulario] = useState<Producto | 'nuevo' | null>(null);
  const [enStock, setEnStock] = useState<Producto | null>(null);
  const [errorFormulario, setErrorFormulario] = useState<string | null>(null);
  const [aEliminar, setAEliminar] = useState<Producto | null>(null);
  const [mensaje, setMensaje] = useState<Mensaje | null>(null);

  const columnas = useMemo(
    () => [
      columna.accessor('id', { header: 'ID' }),
      columna.accessor('nombre', {
        header: 'Nombre',
        cell: (info) => <span className="font-medium text-slate-900">{info.getValue()}</span>,
      }),
      columna.accessor((p) => p.categoria.nombre, { id: 'categoria', header: 'Categoría' }),
      columna.accessor('precio_base', {
        header: 'Precio',
        cell: (info) => formatearPrecio(info.getValue()),
      }),
      columna.accessor('stock', {
        header: 'Stock',
        cell: (info) => (
          <span className={cn(info.getValue() === 0 && 'font-semibold text-red-600')}>{info.getValue()}</span>
        ),
      }),
      columna.accessor('disponible', {
        header: 'Disponible',
        cell: (info) => (
          <span
            className={cn(
              'inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold',
              info.getValue() ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700',
            )}
          >
            {info.getValue() ? 'Sí' : 'No'}
          </span>
        ),
      }),
      columna.display({
        id: 'acciones',
        header: () => <span className="sr-only">Acciones</span>,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button
              variante="secundario"
              tamano="sm"
              onClick={() => {
                setErrorFormulario(null);
                setEnFormulario(row.original);
              }}
            >
              Editar
            </Button>
            <Button
              variante="secundario"
              tamano="sm"
              onClick={() => {
                setErrorFormulario(null);
                setEnStock(row.original);
              }}
            >
              Stock
            </Button>
            <Button variante="peligro" tamano="sm" onClick={() => setAEliminar(row.original)}>
              Eliminar
            </Button>
          </div>
        ),
      }),
    ],
    [],
  );

  const { tabla, busqueda, setBusqueda } = useTablaCliente(productos.data?.items ?? SIN_PRODUCTOS, columnas);

  async function guardar(datos: DatosProducto) {
    try {
      if (enFormulario === 'nuevo') {
        await crear.mutateAsync({
          ...datos,
          descripcion: datos.descripcion || null,
          imagen_url: datos.imagen_url || null,
        });
        setMensaje({ tipo: 'exito', texto: `Se creó el producto «${datos.nombre}».` });
      } else if (enFormulario) {
        const cambios: ProductoUpdate = {
          nombre: datos.nombre,
          descripcion: datos.descripcion,
          precio_base: datos.precio_base,
          imagen_url: datos.imagen_url,
        };
        // Solo si cambió: el backend valida que la categoría enviada esté activa
        if (datos.categoria_id !== enFormulario.categoria_id) cambios.categoria_id = datos.categoria_id;
        await actualizar.mutateAsync({ id: enFormulario.id, datos: cambios });
        setMensaje({ tipo: 'exito', texto: `Se actualizó el producto «${datos.nombre}».` });
      }
      setEnFormulario(null);
    } catch (error) {
      // 404 si la categoría elegida se dio de baja mientras tanto
      setErrorFormulario(handleApiError(error));
    }
  }

  async function guardarStock(datos: ProductoStockUpdate) {
    if (!enStock) return;
    try {
      await actualizarStock.mutateAsync({ id: enStock.id, datos });
      setMensaje({ tipo: 'exito', texto: `Stock de «${enStock.nombre}»: ${datos.stock} unidades.` });
      setEnStock(null);
    } catch (error) {
      setErrorFormulario(handleApiError(error));
    }
  }

  async function confirmarEliminacion() {
    if (!aEliminar) return;
    const { id, nombre } = aEliminar;
    try {
      await eliminar.mutateAsync(id);
      setMensaje({ tipo: 'exito', texto: `Se dio de baja el producto «${nombre}».` });
    } catch (error) {
      setMensaje({ tipo: 'error', texto: handleApiError(error) });
    } finally {
      setAEliminar(null);
    }
  }

  const total = productos.data?.total ?? 0;

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Productos</h1>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Input
            label="Buscar"
            type="search"
            placeholder="Nombre o categoría"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <Button
            disabled={categorias.isPending}
            onClick={() => {
              setErrorFormulario(null);
              setEnFormulario('nuevo');
            }}
          >
            Nuevo producto
          </Button>
        </div>
      </header>

      {mensaje && <Alerta tipo={mensaje.tipo}>{mensaje.texto}</Alerta>}
      {total > FILTROS_PANEL.limit && (
        <Alerta tipo="info">
          Se muestran los primeros {FILTROS_PANEL.limit} de {total} productos.
        </Alerta>
      )}

      {productos.isPending ? (
        <TablaDatosSkeleton />
      ) : productos.isError ? (
        <EstadoError mensaje={handleApiError(productos.error)} onReintentar={() => void productos.refetch()} />
      ) : (
        <TablaDatos
          tabla={tabla}
          actualizando={productos.isFetching}
          mensajeVacio={busqueda ? 'Ningún producto coincide con la búsqueda.' : 'Todavía no hay productos.'}
        />
      )}

      <Modal
        abierto={enFormulario !== null}
        titulo={enFormulario === 'nuevo' ? 'Nuevo producto' : 'Editar producto'}
        onCerrar={() => setEnFormulario(null)}
      >
        <ProductoForm
          producto={enFormulario === 'nuevo' || enFormulario === null ? undefined : enFormulario}
          categorias={categorias.data ?? []}
          onGuardar={guardar}
          onCancelar={() => setEnFormulario(null)}
          errorApi={errorFormulario}
        />
      </Modal>

      <Modal
        abierto={enStock !== null}
        titulo={`Stock de «${enStock?.nombre ?? ''}»`}
        onCerrar={() => setEnStock(null)}
      >
        {enStock && (
          <StockForm
            producto={enStock}
            onGuardar={guardarStock}
            onCancelar={() => setEnStock(null)}
            errorApi={errorFormulario}
          />
        )}
      </Modal>

      <Modal
        abierto={aEliminar !== null}
        titulo={`Eliminar «${aEliminar?.nombre ?? ''}»`}
        onCerrar={() => setAEliminar(null)}
      >
        <p className="text-sm text-slate-600">
          El producto deja de aparecer en el catálogo. Los pedidos que ya lo incluyen conservan sus líneas.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variante="secundario" onClick={() => setAEliminar(null)}>
            Volver
          </Button>
          <Button variante="peligro" cargando={eliminar.isPending} onClick={() => void confirmarEliminacion()}>
            Eliminar
          </Button>
        </div>
      </Modal>
    </section>
  );
}
