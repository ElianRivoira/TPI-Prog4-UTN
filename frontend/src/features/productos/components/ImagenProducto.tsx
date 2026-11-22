import { useState } from 'react';

import { cn } from '@/shared/ui/cn';

interface ImagenProductoProps {
  url: string | null;
  nombre: string;
  className?: string;
}

/** Imagen del producto con un reemplazo si no tiene URL o si la URL no carga. */
export function ImagenProducto({ url, nombre, className }: ImagenProductoProps) {
  const [fallo, setFallo] = useState(false);

  if (!url || fallo) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          'flex items-center justify-center bg-orange-50 text-4xl font-bold text-orange-300',
          className,
        )}
      >
        {nombre.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={nombre}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFallo(true)}
      className={cn('object-cover', className)}
    />
  );
}
