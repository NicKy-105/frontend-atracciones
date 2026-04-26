import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import * as authApi from '../../api/authApi'
import { adminApi } from '../../api/adminApi'
import ErrorMessage from '../../components/common/ErrorMessage'
import { useAuthContext } from '../../context/AuthContext'

const TIPOS_ID = ['CC', 'CEDULA', 'PASAPORTE', 'RUC', 'OTRO']

function RegistroPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { estaAutenticado, login } = useAuthContext()
  const destino = location.state?.from?.pathname || '/atracciones'
  const [form, setForm] = useState({
    loginEmail: '',
    password: '',
    confirmarPassword: '',
    nombres: '',
    apellidos: '',
    tipo_identificacion: 'CEDULA',
    numero_identificacion: '',
    telefono: '',
  })
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  if (estaAutenticado) {
    return <Navigate to="/atracciones" replace />
  }

  const set = (campo) => (e) =>
    setForm((prev) => ({ ...prev, [campo]: e.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    if (form.password !== form.confirmarPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setCargando(true)
    setError('')
    try {
      // 1) Crear cuenta de usuario
      const data = await authApi.registro(form.loginEmail, form.password)
      const token = data?.data?.token
      const usuarioLogin = data?.data?.login || form.loginEmail
      const roles = data?.data?.roles || []

      // 2) Guardar sesión inmediatamente (el interceptor usará el nuevo token)
      login(token, { login: usuarioLogin, roles })

      // 3) Crear perfil de cliente (no bloquea el flujo si falla)
      try {
        await adminApi.createCliente({
          login: usuarioLogin,
          nombres: form.nombres,
          apellidos: form.apellidos,
          correo: form.loginEmail,
          tipo_identificacion: form.tipo_identificacion,
          numero_identificacion: form.numero_identificacion,
          telefono: form.telefono || undefined,
        })
      } catch {
        // El perfil de cliente no pudo crearse, pero la sesión sí está activa
        setError(
          'Cuenta creada, pero no se pudo guardar el perfil de cliente. ' +
          'Puedes continuar usando la aplicación.',
        )
      }

      navigate(destino, { replace: true })
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo completar el registro')
    } finally {
      setCargando(false)
    }
  }

  return (
    <section className="auth-page">
      <form className="auth-form" onSubmit={submit}>
        <h1>Crear cuenta</h1>

        <label>
          Correo electrónico
          <input
            type="email"
            value={form.loginEmail}
            onChange={set('loginEmail')}
            placeholder="correo@ejemplo.com"
            required
          />
        </label>

        <label>
          Nombres
          <input
            type="text"
            value={form.nombres}
            onChange={set('nombres')}
            placeholder="Juan Carlos"
            required
          />
        </label>

        <label>
          Apellidos
          <input
            type="text"
            value={form.apellidos}
            onChange={set('apellidos')}
            placeholder="Pérez López"
            required
          />
        </label>

        <label>
          Tipo de identificación
          <select value={form.tipo_identificacion} onChange={set('tipo_identificacion')}>
            {TIPOS_ID.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label>
          Número de identificación
          <input
            type="text"
            value={form.numero_identificacion}
            onChange={set('numero_identificacion')}
            placeholder="1234567890"
            required
          />
        </label>

        <label>
          Teléfono (opcional)
          <input
            type="tel"
            value={form.telefono}
            onChange={set('telefono')}
            placeholder="+593 99 000 0000"
          />
        </label>

        <label>
          Contraseña
          <input
            type="password"
            value={form.password}
            onChange={set('password')}
            required
          />
        </label>

        <label>
          Confirmar contraseña
          <input
            type="password"
            value={form.confirmarPassword}
            onChange={set('confirmarPassword')}
            required
          />
        </label>

        <ErrorMessage mensaje={error} />
        <button type="submit" className="btn" disabled={cargando}>
          {cargando ? 'Registrando...' : 'Crear cuenta'}
        </button>
      </form>
    </section>
  )
}

export default RegistroPage
