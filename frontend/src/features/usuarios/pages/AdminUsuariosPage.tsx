import { createColumnHelper } from '@tanstack/react-table';
import { useMemo, useState } from 'react';

import { useAuthStore } from '@/store/authStore';
import { handleApiError } from '@/shared/api/handleApiError';
import { EstadoError } from '@/shared/components/EstadoError';
import { TablaDatos, TablaDatosSkeleton } from '@/shared/components/TablaDatos';
import { useTablaCliente } from '@/shared/hooks/useTablaCliente';
import { Alerta } from '@/shared/ui/Alerta';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/ui/cn';
import { Input } from '@/shared/ui/Input';
import { Modal } from '@/shared/ui/Modal';

import { useActivarUsuario, useDesactivarUsuario, useUsuarios } from '../hooks/useUsuarios';
import type { Usuario } from '../types/usuario.types';

const SIN_USUARIOS: Usuario[] = [];
const columna = createColumnHelper<Usuario>();

type Mensaje = { tipo: 'exito' | 'error'; texto: string };

export function AdminUsuariosPage() {
  const idSesion = useAuthStore((s) => s.usuario?.id);
  const usuarios = useUsuarios();
  const activar = useActivarUsuario();
  const desactivar = useDesactivarUsuario();

  const [aDesactivar, setADesactivar] = useState<Usuario | null>(null);
  const [mensaje, setMensaje] = useState<Mensaje | null>(null);

  /** Usuario que se está activando, para mostrar el botón cargando solo en su fila. */
  const activando = activar.isPending ? activar.variables : null;

  const columnas = useMemo(() => {
    async function confirmarActivacion(usuario: Usuario) {
      try {
        await activar.mutateAsync(usuario.id);
        setMensaje({ tipo: 'exito', texto: `Se activó a «${usuario.username}».` });
      } catch (error) {
        setMensaje({ tipo: 'error', texto: handleApiError(error) });
      }
    }

    return [
      columna.accessor('username', {
        header: 'Usuario',
        cell: ({ row, getValue }) => (
          <span className="font-medium text-slate-900">
            {getValue()}
            {row.original.id === idSesion && (
              <>
                {' '}
                <span className="ml-1 text-xs font-normal text-slate-500">(vos)</span>
              </>
            )}
          </span>
        ),
      }),
      columna.accessor('full_name', { header: 'Nombre' }),
      columna.accessor('email', {
        header: 'Email',
        cell: (info) => <span className="text-slate-600">{info.getValue()}</span>,
      }),
      columna.accessor('role', {
        header: 'Rol',
        cell: (info) => (
          <span
            className={cn(
              'inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold',
              info.getValue() === 'admin' ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-700',
            )}
          >
            {info.getValue()}
          </span>
        ),
      }),
      columna.accessor('disabled', {
        header: 'Estado',
        cell: (info) => (
          <span
            className={cn(
              'inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold',
              info.getValue() ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800',
            )}
          >
            {info.getValue() ? 'Desactivado' : 'Activo'}
          </span>
        ),
      }),
      columna.display({
        id: 'acciones',
        header: () => <span className="sr-only">Acciones</span>,
        cell: ({ row }) => {
          const usuario = row.original;
          // El admin no puede desactivarse a sí mismo: en su fila no hay botón (el backend responde 400)
          if (usuario.id === idSesion) return null;
          return (
            <div className="flex justify-end">
              {usuario.disabled ? (
                <Button
                  key="activar"
                  variante="secundario"
                  tamano="sm"
                  cargando={activando === usuario.id}
                  onClick={() => void confirmarActivacion(usuario)}
                >
                  Activar
                </Button>
              ) : (
                <Button key="desactivar" variante="peligro" tamano="sm" onClick={() => setADesactivar(usuario)}>
                  Desactivar
                </Button>
              )}
            </div>
          );
        },
      }),
    ];
    // mutateAsync y los setters de useState son estables
  }, [idSesion, activando]);

  const { tabla, busqueda, setBusqueda } = useTablaCliente(usuarios.data ?? SIN_USUARIOS, columnas);

  async function confirmarDesactivacion() {
    if (!aDesactivar) return;
    const { id, username } = aDesactivar;
    try {
      await desactivar.mutateAsync(id);
      setMensaje({ tipo: 'exito', texto: `Se desactivó a «${username}».` });
    } catch (error) {
      setMensaje({ tipo: 'error', texto: handleApiError(error) });
    } finally {
      setADesactivar(null);
    }
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Usuarios</h1>
        <div className="sm:w-72">
          <Input
            label="Buscar"
            type="search"
            placeholder="Usuario, nombre o email"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </header>

      {mensaje && <Alerta tipo={mensaje.tipo}>{mensaje.texto}</Alerta>}

      {usuarios.isPending ? (
        <TablaDatosSkeleton />
      ) : usuarios.isError ? (
        <EstadoError mensaje={handleApiError(usuarios.error)} onReintentar={() => void usuarios.refetch()} />
      ) : (
        <TablaDatos
          tabla={tabla}
          actualizando={usuarios.isFetching}
          mensajeVacio={busqueda ? 'Ningún usuario coincide con la búsqueda.' : 'Todavía no hay usuarios.'}
        />
      )}

      <Modal
        abierto={aDesactivar !== null}
        titulo={`Desactivar a «${aDesactivar?.username ?? ''}»`}
        onCerrar={() => setADesactivar(null)}
      >
        <p className="text-sm text-slate-600">
          El usuario no va a poder iniciar sesión y, si tiene una sesión abierta, se le cierra en su próxima
          acción. Sus pedidos se conservan y se lo puede volver a activar.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variante="secundario" onClick={() => setADesactivar(null)}>
            Volver
          </Button>
          <Button variante="peligro" cargando={desactivar.isPending} onClick={() => void confirmarDesactivacion()}>
            Desactivar
          </Button>
        </div>
      </Modal>
    </section>
  );
}
