import { flexRender, type Table } from '@tanstack/react-table';

import { cn } from '../ui/cn';
import { Paginacion } from './Paginacion';
import { Skeleton } from './Skeleton';

interface TablaDatosProps<T> {
  tabla: Table<T>;
  /** Texto de la fila vacía (sin registros o sin coincidencias con la búsqueda). */
  mensajeVacio: string;
  /** Atenúa la tabla mientras se vuelven a pedir los datos. */
  actualizando?: boolean;
}

const INDICADOR_ORDEN = { asc: '▲', desc: '▼' } as const;

/** Dibuja una tabla de TanStack Table con encabezados ordenables y paginación. */
export function TablaDatos<T>({ tabla, mensajeVacio, actualizando = false }: TablaDatosProps<T>) {
  const filas = tabla.getRowModel().rows;
  const { pageIndex, pageSize } = tabla.getState().pagination;

  return (
    <div className="flex flex-col gap-4">
      <div
        className={cn(
          'overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm transition-opacity',
          actualizando && 'opacity-60',
        )}
      >
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            {tabla.getHeaderGroups().map((grupo) => (
              <tr key={grupo.id} className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                {grupo.headers.map((header) => {
                  const orden = header.column.getIsSorted();
                  const contenido = flexRender(header.column.columnDef.header, header.getContext());
                  return (
                    <th
                      key={header.id}
                      scope="col"
                      aria-sort={orden === 'asc' ? 'ascending' : orden === 'desc' ? 'descending' : undefined}
                      className="whitespace-nowrap px-4 py-3 font-medium"
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1 uppercase hover:text-slate-800"
                        >
                          {contenido}
                          <span aria-hidden="true" className="text-[0.6rem]">
                            {orden ? INDICADOR_ORDEN[orden] : '↕'}
                          </span>
                        </button>
                      ) : (
                        contenido
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filas.length === 0 ? (
              <tr>
                <td colSpan={tabla.getVisibleLeafColumns().length} className="px-4 py-10 text-center text-slate-500">
                  {mensajeVacio}
                </td>
              </tr>
            ) : (
              filas.map((fila) => (
                <tr key={fila.id} className="hover:bg-slate-50">
                  {fila.getVisibleCells().map((celda) => (
                    <td key={celda.id} className="px-4 py-3 align-middle text-slate-800">
                      {flexRender(celda.column.columnDef.cell, celda.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Paginacion
        pagina={pageIndex}
        total={tabla.getFilteredRowModel().rows.length}
        limit={pageSize}
        onCambiar={tabla.setPageIndex}
      />
    </div>
  );
}

/** Placeholder de la tabla mientras llega la primera respuesta. */
export function TablaDatosSkeleton({ filas = 5 }: { filas?: number }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <Skeleton className="h-6 w-full" />
      {Array.from({ length: filas }, (_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}
