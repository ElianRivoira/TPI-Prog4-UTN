import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type TableOptions,
} from '@tanstack/react-table';
import { useState } from 'react';

const FILAS_POR_PAGINA = 10;

/**
 * TanStack Table con búsqueda, orden y paginación del lado del cliente: el panel trae la lista
 * completa (hasta 100 registros) y la tabla la filtra y la pagina en memoria.
 *
 * `datos` debe ser una referencia estable (la de TanStack Query o una constante), no un `[]` nuevo
 * en cada render.
 */
export function useTablaCliente<T>(datos: T[], columnas: TableOptions<T>['columns']) {
  const [busqueda, setBusquedaInterna] = useState('');

  const tabla = useReactTable({
    data: datos,
    columns: columnas,
    state: { globalFilter: busqueda },
    onGlobalFilterChange: setBusquedaInterna,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // Al editar una fila los datos se vuelven a pedir: no se salta a la primera página
    autoResetPageIndex: false,
    initialState: { pagination: { pageIndex: 0, pageSize: FILAS_POR_PAGINA } },
  });

  // Si una baja deja vacía la última página, se retrocede a la anterior que tenga filas
  const { pageIndex } = tabla.getState().pagination;
  const ultimaPagina = Math.max(0, tabla.getPageCount() - 1);
  if (pageIndex > ultimaPagina) tabla.setPageIndex(ultimaPagina);

  /** Cambia la búsqueda y vuelve a la primera página de resultados. */
  function setBusqueda(valor: string) {
    setBusquedaInterna(valor);
    tabla.setPageIndex(0);
  }

  return { tabla, busqueda, setBusqueda };
}
