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
