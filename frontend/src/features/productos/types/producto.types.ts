import type { Categoria } from '@/features/categorias/types/categoria.types';

/** ProductoRead en el backend. */
export interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  imagen_url: string | null;
  stock: number;
  disponible: boolean;
  activo: boolean;
  categoria_id: number;
  categoria: Categoria;
}

/** ProductosPaginados en el backend. */
export interface ProductosPaginados {
  total: number;
  items: Producto[];
}

/** Parámetros de GET /productos. */
export interface FiltrosProductos {
  skip: number;
  limit: number;
  search?: string;
  categoria_id?: number;
  disponible?: boolean;
}

/** ProductoCreate en el backend. */
export interface ProductoCreate {
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  imagen_url: string | null;
  stock: number;
  disponible: boolean;
  categoria_id: number;
}

/**
 * ProductoUpdate: el backend ignora los campos en null, por eso un texto vacío va como ''. El stock
 * y la disponibilidad se cambian con PATCH /productos/{id}/stock.
 */
export interface ProductoUpdate {
  nombre?: string;
  descripcion?: string;
  precio_base?: number;
  imagen_url?: string;
  categoria_id?: number;
}

/** ProductoStockUpdate en el backend. */
export interface ProductoStockUpdate {
  stock: number;
  disponible: boolean;
}
