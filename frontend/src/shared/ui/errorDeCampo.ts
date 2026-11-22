interface MetaDeCampo {
  isTouched: boolean;
  errors: ReadonlyArray<unknown>;
}

/**
 * Primer error de un campo de TanStack Form, solo si el usuario ya lo tocó (al enviar, TanStack
 * Form marca todos los campos como tocados). Los validadores devuelven string o undefined.
 */
export function errorDeCampo(meta: MetaDeCampo): string | undefined {
  if (!meta.isTouched) return undefined;
  return meta.errors.find((e): e is string => typeof e === 'string' && e.length > 0);
}
