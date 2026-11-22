import { useId, type InputHTMLAttributes } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  /** Aclaración debajo de la etiqueta. */
  detalle?: string;
}

export function Checkbox({ label, detalle, id, ...props }: CheckboxProps) {
  const idGenerado = useId();
  const checkboxId = id ?? idGenerado;

  return (
    <label htmlFor={checkboxId} className="flex cursor-pointer items-start gap-3">
      <input id={checkboxId} type="checkbox" className="mt-0.5 size-4 accent-orange-600" {...props} />
      <span>
        <span className="block text-sm font-medium text-slate-700">{label}</span>
        {detalle && <span className="block text-xs text-slate-500">{detalle}</span>}
      </span>
    </label>
  );
}
