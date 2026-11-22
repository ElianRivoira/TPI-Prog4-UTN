import { useForm } from '@tanstack/react-form';

import { Alerta } from '@/shared/ui/Alerta';
import { Button } from '@/shared/ui/Button';
import { Checkbox } from '@/shared/ui/Checkbox';
import { errorDeCampo } from '@/shared/ui/errorDeCampo';
import { Input } from '@/shared/ui/Input';

import type { Producto, ProductoStockUpdate } from '../types/producto.types';
import { validarStock } from '../utils/validaciones';

interface StockFormProps {
  producto: Producto;
  onGuardar: (datos: ProductoStockUpdate) => Promise<void>;
  onCancelar: () => void;
  errorApi: string | null;
}

/** Cambio de stock y disponibilidad (PATCH /productos/{id}/stock). */
export function StockForm({ producto, onGuardar, onCancelar, errorApi }: StockFormProps) {
  const form = useForm({
    defaultValues: {
      stock: String(producto.stock),
      disponible: producto.disponible,
    },
    onSubmit: async ({ value }) => onGuardar({ stock: Number(value.stock), disponible: value.disponible }),
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
      <form.Field name="stock" validators={{ onChange: validarStock }}>
        {(field) => (
          <Input
            label="Stock"
            name={field.name}
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            autoFocus
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
            detalle="Si no, no aparece en el catálogo aunque tenga stock"
            name={field.name}
            checked={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.checked)}
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
              Guardar stock
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
