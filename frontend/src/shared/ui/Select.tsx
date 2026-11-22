import { useId, type SelectHTMLAttributes } from 'react';

import { cn } from './cn';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
}

export function Select({ label, error, id, className, children, ...props }: SelectProps) {
  const idGenerado = useId();
  const selectId = id ?? idGenerado;
  const errorId = `${selectId}-error`;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={selectId} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        id={selectId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'rounded-lg border bg-white px-3 py-2 text-sm outline-none transition-colors',
          'focus:border-orange-500 focus:ring-2 focus:ring-orange-200',
          error ? 'border-red-400' : 'border-slate-300',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p id={errorId} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
