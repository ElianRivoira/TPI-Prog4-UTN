/** CategoriaRead en el backend. */
export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

/** CategoriaCreate en el backend. */
export interface CategoriaCreate {
  nombre: string;
  descripcion: string | null;
}

/** CategoriaUpdate: el backend ignora los campos en null, por eso una descripción vacía va como ''. */
export interface CategoriaUpdate {
  nombre?: string;
  descripcion?: string;
}
