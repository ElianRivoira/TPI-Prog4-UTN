import { useForm } from '@tanstack/react-form';

import { Alerta } from '@/shared/ui/Alerta';
import { Button } from '@/shared/ui/Button';
import { errorDeCampo } from '@/shared/ui/errorDeCampo';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';

import type { Categoria } from '../types/categoria.types';

/** Valores del formulario, ya sin espacios en los extremos. */
export interface DatosCategoria {
  nombre: string;
  descripcion: string;
}

interface CategoriaFormProps {
  /** Categoría a editar; sin ella el formulario crea una nueva. */
  categoria?: Categoria;
  onGuardar: (datos: DatosCategoria) => Promise<void>;
  onCancelar: () => void;
  errorApi: string | null;
}

// Mismas reglas que CategoriaCreate en el backend
const validarNombre = ({ value }: { value: string }) => {
  const v = value.trim();
  if (v.length < 2) return 'El nombre debe tener al menos 2 caracteres';
  if (v.length > 100) return 'Máximo 100 caracteres';
  return undefined;
};

export function CategoriaForm({ categoria, onGuardar, onCancelar, errorApi }: CategoriaFormProps) {
  const form = useForm({
    defaultValues: {
      nombre: categoria?.nombre ?? '',
      descripcion: categoria?.descripcion ?? '',
    } as DatosCategoria,
    onSubmit: async ({ value }) =>
      onGuardar({ nombre: value.nombre.trim(), descripcion: value.descripcion.trim() }),
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
            maxLength={100}
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

      {errorApi && <Alerta>{errorApi}</Alerta>}

      <div className="flex justify-end gap-2">
        <Button variante="secundario" onClick={onCancelar}>
          Cancelar
        </Button>
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(enviando) => (
            <Button type="submit" cargando={enviando}>
              {categoria ? 'Guardar cambios' : 'Crear categoría'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
