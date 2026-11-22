import { useId, type TextareaHTMLAttributes } from 'react';

import { cn } from './cn';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function Textarea({ label, error, id, className, rows = 3, ...props }: TextareaProps) {
  const idGenerado = useId();
  const textareaId = id ?? idGenerado;
  const errorId = `${textareaId}-error`;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={textareaId} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <textarea
        id={textareaId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'resize-y rounded-lg border bg-white px-3 py-2 text-sm outline-none transition-colors',
          'focus:border-orange-500 focus:ring-2 focus:ring-orange-200',
          error ? 'border-red-400' : 'border-slate-300',
          className,
        )}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
