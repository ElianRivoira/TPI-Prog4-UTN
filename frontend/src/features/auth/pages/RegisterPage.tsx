import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';

import { useAuthStore } from '@/store/authStore';
import { Alerta } from '@/shared/ui/Alerta';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { errorDeCampo } from '@/shared/ui/errorDeCampo';
import { Input } from '@/shared/ui/Input';

import { useRegistro } from '../hooks/useRegistro';
import { destinoTrasLogin } from '../utils/destinoTrasLogin';
import { mensajeErrorAuth } from '../utils/mensajeErrorAuth';

// Mismas reglas que UserCreate en el backend (app/modules/usuarios/schemas.py)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validarUsername = ({ value }: { value: string }) => {
  const v = value.trim();
  if (v.length < 3) return 'Mínimo 3 caracteres';
  if (v.length > 50) return 'Máximo 50 caracteres';
  if (v.includes(' ')) return 'No puede tener espacios';
  return undefined;
};

const validarNombre = ({ value }: { value: string }) => {
  const v = value.trim();
  if (!v) return 'Ingresá tu nombre';
  if (v.length > 100) return 'Máximo 100 caracteres';
  return undefined;
};

const validarEmail = ({ value }: { value: string }) =>
  EMAIL_RE.test(value.trim()) ? undefined : 'Ingresá un email válido';

const validarPassword = ({ value }: { value: string }) => {
  if (value.length < 8) return 'Mínimo 8 caracteres';
  // bcrypt procesa hasta 72 bytes; un carácter acentuado ocupa más de uno
  if (new TextEncoder().encode(value).length > 72) return 'Máximo 72 bytes';
  return undefined;
};

export function RegisterPage() {
  const usuario = useAuthStore((s) => s.usuario);
  const cargando = useAuthStore((s) => s.cargando);
  const login = useAuthStore((s) => s.login);
  const location = useLocation();
  const registro = useRegistro();
  const [errorApi, setErrorApi] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { username: '', full_name: '', email: '', password: '', confirmacion: '' },
    onSubmit: async ({ value }) => {
      setErrorApi(null);
      const { confirmacion: _confirmacion, ...datos } = value;
      try {
        await registro.mutateAsync({
          ...datos,
          username: datos.username.trim(),
          full_name: datos.full_name.trim(),
          email: datos.email.trim(),
        });
      } catch (error) {
        // 409: el usuario o el email ya existen
        setErrorApi(mensajeErrorAuth(error));
        return;
      }
      try {
        // Cuenta creada: se inicia sesión con las mismas credenciales
        await login(datos.username.trim(), datos.password);
      } catch {
        setErrorApi('La cuenta se creó, pero no se pudo iniciar sesión. Probá desde «Ingresar».');
      }
    },
  });

  if (usuario && !cargando) {
    return <Navigate to={destinoTrasLogin(location.state, usuario.role)} replace />;
  }

  return (
    <Card className="mx-auto mt-8 w-full max-w-sm p-6">
      <h1 className="text-xl font-semibold text-slate-900">Crear cuenta</h1>

      <form
        noValidate
        className="mt-6 flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          void form.handleSubmit();
        }}
      >
        <form.Field name="username" validators={{ onChange: validarUsername }}>
          {(field) => (
            <Input
              label="Usuario"
              name={field.name}
              autoComplete="username"
              autoFocus
              maxLength={50}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={errorDeCampo(field.state.meta)}
            />
          )}
        </form.Field>

        <form.Field name="full_name" validators={{ onChange: validarNombre }}>
          {(field) => (
            <Input
              label="Nombre completo"
              name={field.name}
              autoComplete="name"
              maxLength={100}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={errorDeCampo(field.state.meta)}
            />
          )}
        </form.Field>

        <form.Field name="email" validators={{ onChange: validarEmail }}>
          {(field) => (
            <Input
              label="Email"
              type="email"
              name={field.name}
              autoComplete="email"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={errorDeCampo(field.state.meta)}
            />
          )}
        </form.Field>

        <form.Field name="password" validators={{ onChange: validarPassword }}>
          {(field) => (
            <Input
              label="Contraseña"
              type="password"
              name={field.name}
              autoComplete="new-password"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={errorDeCampo(field.state.meta)}
            />
          )}
        </form.Field>

        <form.Field
          name="confirmacion"
          validators={{
            // Se vuelve a validar cuando cambia la contraseña
            onChangeListenTo: ['password'],
            onChange: ({ value, fieldApi }) =>
              value === fieldApi.form.getFieldValue('password')
                ? undefined
                : 'Las contraseñas no coinciden',
          }}
        >
          {(field) => (
            <Input
              label="Repetir contraseña"
              type="password"
              name={field.name}
              autoComplete="new-password"
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
              Crear cuenta
            </Button>
          )}
        </form.Subscribe>
      </form>

      <p className="mt-4 text-center text-sm text-slate-600">
        ¿Ya tenés cuenta?{' '}
        <Link
          to="/login"
          state={location.state}
          className="font-medium text-orange-600 hover:text-orange-700"
        >
          Ingresá
        </Link>
      </p>
    </Card>
  );
}
