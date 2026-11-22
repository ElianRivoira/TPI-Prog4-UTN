import { useEffect, useState } from 'react';

/**
 * Devuelve el valor recién cuando dejó de cambiar durante `demoraMs`. Evita una petición por cada
 * tecla en la búsqueda. El useEffect solo maneja un temporizador: no obtiene datos del servidor.
 */
export function useDebounce<T>(valor: T, demoraMs = 400): T {
  const [demorado, setDemorado] = useState(valor);

  useEffect(() => {
    const id = setTimeout(() => setDemorado(valor), demoraMs);
    return () => clearTimeout(id);
  }, [valor, demoraMs]);

  return demorado;
}
