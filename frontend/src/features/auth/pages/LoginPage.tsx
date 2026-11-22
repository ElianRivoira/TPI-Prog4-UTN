import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';

import { useAuthStore } from '@/store/authStore';
import { Alerta } from '@/shared/ui/Alerta';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { errorDeCampo } from '@/shared/ui/errorDeCampo';
import { Input } from '@/shared/ui/Input';

import { destinoTrasLogin } from '../utils/destinoTrasLogin';
import { mensajeErrorAuth } from '../utils/mensajeErrorAuth';

const requerido =
  (mensaje: string) =>
  ({ value }: { value: string }) =>
    value.trim() ? undefined : mensaje;

export function LoginPage() {
  const usuario = useAuthStore((s) => s.usuario);
  const cargando = useAuthStore((s) => s.cargando);
  const login = useAuthStore((s) => s.login);
  const location = useLocation();
  const [errorApi, setErrorApi] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { username: '', password: '' },
    onSubmit: async ({ value }) => {
      setErrorApi(null);
      try {
        // Al quedar el usuario en el store, el componente redirige (ver abajo)
        await login(value.username.trim(), value.password);
      } catch (error) {
        // 401 credenciales incorrectas, 400 cuenta desactivada: se muestra el detail del backend
        setErrorApi(mensajeErrorAuth(error));
      }
    },
  });

  // Con sesión confirmada no tiene sentido el formulario: vuelve a la pantalla pedida
  if (usuario && !cargando) {
    return <Navigate to={destinoTrasLogin(location.state, usuario.role)} replace />;
  }

  return (
    <Card className="mx-auto mt-8 w-full max-w-sm p-6">
      <h1 className="text-xl font-semibold text-slate-900">Iniciar sesión</h1>
      <p className="mt-1 text-sm text-slate-500">Ingresá con tu usuario para hacer pedidos.</p>

      <form
        noValidate
        className="mt-6 flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          void form.handleSubmit();
        }}
      >
        <form.Field name="username" validators={{ onChange: requerido('Ingresá tu usuario') }}>
          {(field) => (
            <Input
              label="Usuario"
              name={field.name}
              autoComplete="username"
              autoFocus
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={errorDeCampo(field.state.meta)}
            />
          )}
        </form.Field>

        <form.Field name="password" validators={{ onChange: requerido('Ingresá tu contraseña') }}>
          {(field) => (
            <Input
              label="Contraseña"
              type="password"
              name={field.name}
              autoComplete="current-password"
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
              Ingresar
            </Button>
          )}
        </form.Subscribe>
      </form>

      <p className="mt-4 text-center text-sm text-slate-600">
        ¿No tenés cuenta?{' '}
        <Link
          to="/register"
          state={location.state}
          className="font-medium text-orange-600 hover:text-orange-700"
        >
          Registrate
        </Link>
      </p>
    </Card>
  );
}
