import { createColumnHelper } from '@tanstack/react-table';
import { useMemo, useState } from 'react';

import { handleApiError } from '@/shared/api/handleApiError';
import { EstadoError } from '@/shared/components/EstadoError';
import { TablaDatos, TablaDatosSkeleton } from '@/shared/components/TablaDatos';
import { useTablaCliente } from '@/shared/hooks/useTablaCliente';
import { Alerta } from '@/shared/ui/Alerta';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Modal } from '@/shared/ui/Modal';

import { CategoriaForm, type DatosCategoria } from '../components/CategoriaForm';
import {
  useActualizarCategoria,
  useCategorias,
  useCrearCategoria,
  useEliminarCategoria,
} from '../hooks/useCategorias';
import type { Categoria } from '../types/categoria.types';

const SIN_CATEGORIAS: Categoria[] = [];
const columna = createColumnHelper<Categoria>();

type Mensaje = { tipo: 'exito' | 'error'; texto: string };

export function AdminCategoriasPage() {
  const categorias = useCategorias();
  const crear = useCrearCategoria();
  const actualizar = useActualizarCategoria();
  const eliminar = useEliminarCategoria();

  /** 'nueva' abre el formulario vacío; una categoría lo abre para editarla. */
  const [enFormulario, setEnFormulario] = useState<Categoria | 'nueva' | null>(null);
  const [errorFormulario, setErrorFormulario] = useState<string | null>(null);
  const [aEliminar, setAEliminar] = useState<Categoria | null>(null);
  const [mensaje, setMensaje] = useState<Mensaje | null>(null);

  function abrirFormulario(categoria: Categoria | 'nueva') {
    setErrorFormulario(null);
    setEnFormulario(categoria);
  }

  const columnas = useMemo(
    () => [
      columna.accessor('id', { header: 'ID' }),
      columna.accessor('nombre', {
        header: 'Nombre',
        cell: (info) => <span className="font-medium text-slate-900">{info.getValue()}</span>,
      }),
      columna.accessor('descripcion', {
        header: 'Descripción',
        enableSorting: false,
        cell: (info) => <span className="text-slate-600">{info.getValue() || '—'}</span>,
      }),
      columna.display({
        id: 'acciones',
        header: () => <span className="sr-only">Acciones</span>,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button variante="secundario" tamano="sm" onClick={() => abrirFormulario(row.original)}>
              Editar
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

  const { tabla, busqueda, setBusqueda } = useTablaCliente(categorias.data ?? SIN_CATEGORIAS, columnas);

  async function guardar(datos: DatosCategoria) {
    try {
      if (enFormulario === 'nueva') {
        await crear.mutateAsync({ nombre: datos.nombre, descripcion: datos.descripcion || null });
        setMensaje({ tipo: 'exito', texto: `Se creó la categoría «${datos.nombre}».` });
      } else if (enFormulario) {
        await actualizar.mutateAsync({ id: enFormulario.id, datos });
        setMensaje({ tipo: 'exito', texto: `Se actualizó la categoría «${datos.nombre}».` });
      }
      setEnFormulario(null);
    } catch (error) {
      // 409 si el nombre ya existe: el formulario queda abierto con el mensaje
      setErrorFormulario(handleApiError(error));
    }
  }

  async function confirmarEliminacion() {
    if (!aEliminar) return;
    const { id, nombre } = aEliminar;
    try {
      await eliminar.mutateAsync(id);
      setMensaje({ tipo: 'exito', texto: `Se dio de baja la categoría «${nombre}».` });
    } catch (error) {
      setMensaje({ tipo: 'error', texto: handleApiError(error) });
    } finally {
      setAEliminar(null);
    }
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Categorías</h1>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Input
            label="Buscar"
            type="search"
            placeholder="Nombre o descripción"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <Button onClick={() => abrirFormulario('nueva')}>Nueva categoría</Button>
        </div>
      </header>

      {mensaje && <Alerta tipo={mensaje.tipo}>{mensaje.texto}</Alerta>}

      {categorias.isPending ? (
        <TablaDatosSkeleton />
      ) : categorias.isError ? (
        <EstadoError mensaje={handleApiError(categorias.error)} onReintentar={() => void categorias.refetch()} />
      ) : (
        <TablaDatos
          tabla={tabla}
          actualizando={categorias.isFetching}
          mensajeVacio={busqueda ? 'Ninguna categoría coincide con la búsqueda.' : 'Todavía no hay categorías.'}
        />
      )}

      <Modal
        abierto={enFormulario !== null}
        titulo={enFormulario === 'nueva' ? 'Nueva categoría' : 'Editar categoría'}
        onCerrar={() => setEnFormulario(null)}
      >
        <CategoriaForm
          categoria={enFormulario === 'nueva' || enFormulario === null ? undefined : enFormulario}
          onGuardar={guardar}
          onCancelar={() => setEnFormulario(null)}
          errorApi={errorFormulario}
        />
      </Modal>

      <Modal
        abierto={aEliminar !== null}
        titulo={`Eliminar «${aEliminar?.nombre ?? ''}»`}
        onCerrar={() => setAEliminar(null)}
      >
        <p className="text-sm text-slate-600">
          La categoría deja de aparecer en el catálogo y en los filtros. Sus productos no se dan de baja.
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
