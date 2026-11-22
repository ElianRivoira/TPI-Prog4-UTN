import { useForm } from '@tanstack/react-form';

import { Alerta } from '@/shared/ui/Alerta';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/ui/cn';
import { errorDeCampo } from '@/shared/ui/errorDeCampo';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';

import type { FormaPago } from '../types/pedido.types';

export interface DatosCheckout {
  direccion_entrega: string;
  forma_pago: FormaPago;
  notas: string;
}

interface CheckoutFormProps {
  /** Envía el pedido; si la API rechaza, la página muestra el error en `errorApi`. */
  onConfirmar: (datos: DatosCheckout) => Promise<void>;
  errorApi: string | null;
}

const FORMAS_PAGO: Array<{ valor: FormaPago; etiqueta: string; detalle: string }> = [
  { valor: 'EFECTIVO', etiqueta: 'Efectivo', detalle: 'Pagás al recibir el pedido' },
  { valor: 'TRANSFERENCIA', etiqueta: 'Transferencia', detalle: 'Pago manual, se coordina con el local' },
];

// Mismas reglas que PedidoCreate en el backend (RN-06)
const validarDireccion = ({ value }: { value: string }) => {
  const v = value.trim();
  if (v.length < 5) return 'La dirección debe tener al menos 5 caracteres';
  if (v.length > 200) return 'Máximo 200 caracteres';
  return undefined;
};

const validarNotas = ({ value }: { value: string }) =>
  value.trim().length > 500 ? 'Máximo 500 caracteres' : undefined;

export function CheckoutForm({ onConfirmar, errorApi }: CheckoutFormProps) {
  const form = useForm({
    defaultValues: {
      direccion_entrega: '',
      forma_pago: 'EFECTIVO',
      notas: '',
    } as DatosCheckout,
    onSubmit: async ({ value }) => onConfirmar(value),
  });

  return (
    <form
      noValidate
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <form.Field name="direccion_entrega" validators={{ onChange: validarDireccion }}>
        {(field) => (
          <Input
            label="Dirección de entrega"
            name={field.name}
            autoComplete="street-address"
            placeholder="Calle, número, piso y departamento"
            maxLength={200}
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={errorDeCampo(field.state.meta)}
          />
        )}
      </form.Field>

      <form.Field name="forma_pago">
        {(field) => (
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-medium text-slate-700">Forma de pago</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {FORMAS_PAGO.map((opcion) => {
                const elegida = field.state.value === opcion.valor;
                return (
                  <label
                    key={opcion.valor}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors',
                      elegida ? 'border-orange-500 bg-orange-50' : 'border-slate-300 hover:bg-slate-50',
                    )}
                  >
                    <input
                      type="radio"
                      name={field.name}
                      value={opcion.valor}
                      checked={elegida}
                      onChange={() => field.handleChange(opcion.valor)}
                      onBlur={field.handleBlur}
                      className="mt-1 accent-orange-600"
                    />
                    <span>
                      <span className="block text-sm font-medium text-slate-900">
                        {opcion.etiqueta}
                      </span>
                      <span className="block text-xs text-slate-500">{opcion.detalle}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}
      </form.Field>

      <form.Field name="notas" validators={{ onChange: validarNotas }}>
        {(field) => (
          <Textarea
            label="Notas (opcional)"
            name={field.name}
            placeholder="Por ejemplo: tocar timbre 2B"
            maxLength={500}
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={errorDeCampo(field.state.meta)}
          />
        )}
      </form.Field>

      {errorApi && <Alerta>{errorApi}</Alerta>}

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(enviando) => (
          <Button type="submit" cargando={enviando}>
            Confirmar pedido
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
