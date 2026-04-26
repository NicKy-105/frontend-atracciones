import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import ErrorMessage from '../../components/common/ErrorMessage'
import { useAuthContext } from '../../context/AuthContext'
import { useAuth } from '../hooks/useAuth'

function LoginPage() {
  const [form, setForm] = useState({ login: '', password: '' })
  const { estaAutenticado } = useAuthContext()
  const { cargando, error, iniciarSesion } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const destino = location.state?.from?.pathname || '/atracciones'

  if (estaAutenticado) {
    return <Navigate to={destino} replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      await iniciarSesion(form.login, form.password)
      navigate(destino, { replace: true })
    } catch {
      // error ya guardado en el hook
    }
  }

  return (
    <section className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Iniciar sesión</h1>
        <label>
          Usuario
          <input
            type="text"
            value={form.login}
            onChange={(e) => setForm((prev) => ({ ...prev, login: e.target.value }))}
            required
            autoComplete="username"
          />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            required
            autoComplete="current-password"
          />
        </label>
        <ErrorMessage mensaje={error} />
        <button type="submit" className="btn" disabled={cargando}>
          {cargando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </section>
  )
}

export default LoginPage
