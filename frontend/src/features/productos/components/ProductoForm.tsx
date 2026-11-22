import { useForm } from '@tanstack/react-form';

import type { Categoria } from '@/features/categorias/types/categoria.types';
import { Alerta } from '@/shared/ui/Alerta';
import { Button } from '@/shared/ui/Button';
import { Checkbox } from '@/shared/ui/Checkbox';
import { errorDeCampo } from '@/shared/ui/errorDeCampo';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { Textarea } from '@/shared/ui/Textarea';

import type { Producto } from '../types/producto.types';
import {
  validarCategoria,
  validarImagenUrl,
  validarNombre,
  validarPrecio,
  validarStock,
} from '../utils/validaciones';

/** Valores del formulario ya convertidos: textos sin espacios en los extremos y números. */
export interface DatosProducto {
  nombre: string;
  descripcion: string;
  precio_base: number;
  imagen_url: string;
  categoria_id: number;
  /** Solo se usan al crear; al editar se cambian con el formulario de stock. */
  stock: number;
  disponible: boolean;
}

interface ValoresFormulario {
  nombre: string;
  descripcion: string;
  precio_base: string;
  imagen_url: string;
  categoria_id: string;
  stock: string;
  disponible: boolean;
}

interface ProductoFormProps {
  /** Producto a editar; sin él el formulario crea uno nuevo. */
  producto?: Producto;
  categorias: Categoria[];
  onGuardar: (datos: DatosProducto) => Promise<void>;
  onCancelar: () => void;
  errorApi: string | null;
}

export function ProductoForm({ producto, categorias, onGuardar, onCancelar, errorApi }: ProductoFormProps) {
  const editando = producto !== undefined;

  // Un producto puede pertenecer a una categoría dada de baja: se muestra igual para no perderla
  const categoriaInactiva =
    producto && !categorias.some((c) => c.id === producto.categoria_id) ? producto.categoria : null;

  const form = useForm({
    defaultValues: {
      nombre: producto?.nombre ?? '',
      descripcion: producto?.descripcion ?? '',
      precio_base: producto ? String(producto.precio_base) : '',
      imagen_url: producto?.imagen_url ?? '',
      categoria_id: producto ? String(producto.categoria_id) : '',
      stock: '0',
      disponible: true,
    } as ValoresFormulario,
    onSubmit: async ({ value }) =>
      onGuardar({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim(),
        precio_base: Number(value.precio_base),
        imagen_url: value.imagen_url.trim(),
        categoria_id: Number(value.categoria_id),
        stock: Number(value.stock),
        disponible: value.disponible,
      }),
  });

  return (
    <form
      noValidate
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <form.Field name="nombre" validators={{ onChange: validarNombre }}>
        {(field) => (
          <Input
            label="Nombre"
            name={field.name}
            maxLength={150}
            autoFocus
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={errorDeCampo(field.state.meta)}
          />
        )}
      </form.Field>

      <form.Field name="descripcion">
        {(field) => (
          <Textarea
            label="Descripción (opcional)"
            name={field.name}
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
          />
        )}
      </form.Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <form.Field name="precio_base" validators={{ onChange: validarPrecio }}>
          {(field) => (
            <Input
              label="Precio"
              name={field.name}
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={errorDeCampo(field.state.meta)}
            />
          )}
        </form.Field>

        <form.Field name="categoria_id" validators={{ onChange: validarCategoria }}>
          {(field) => (
            <Select
              label="Categoría"
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={errorDeCampo(field.state.meta)}
            >
              <option value="">Elegí una categoría</option>
              {categoriaInactiva && (
                <option value={categoriaInactiva.id}>{categoriaInactiva.nombre} (dada de baja)</option>
              )}
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </Select>
          )}
        </form.Field>
      </div>

      <form.Field name="imagen_url" validators={{ onChange: validarImagenUrl }}>
        {(field) => (
          <Input
            label="URL de la imagen (opcional)"
            name={field.name}
            type="url"
            placeholder="https://..."
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={errorDeCampo(field.state.meta)}
          />
        )}
      </form.Field>

      {editando ? (
        <p className="text-xs text-slate-500">
          El stock y la disponibilidad se cambian con el botón «Stock» de la tabla.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 sm:items-center">
          <form.Field name="stock" validators={{ onChange: validarStock }}>
            {(field) => (
              <Input
                label="Stock inicial"
                name={field.name}
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={errorDeCampo(field.state.meta)}
              />
            )}
          </form.Field>

          <form.Field name="disponible">
            {(field) => (
              <Checkbox
                label="Disponible para la venta"
                detalle="Si no, no aparece en el catálogo"
                name={field.name}
                checked={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.checked)}
              />
            )}
          </form.Field>
        </div>
      )}

      {errorApi && <Alerta>{errorApi}</Alerta>}

      <div className="flex justify-end gap-2">
        <Button variante="secundario" onClick={onCancelar}>
          Cancelar
        </Button>
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(enviando) => (
            <Button type="submit" cargando={enviando}>
              {editando ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
