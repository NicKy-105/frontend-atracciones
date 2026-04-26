import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import ErrorMessage from '../../components/common/ErrorMessage'
import { useAuthContext } from '../../context/AuthContext'
import { useAuth } from '../hooks/useAuth'

function LoginPage() {
  const [form, setForm] = useState({ login: '', password: '' })
  const { estaAutenticado } = useAuthContext()
  const { cargando, error, iniciarSesion } = useAuth()

  if (estaAutenticado) {
    return <Navigate to="/atracciones" replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    await iniciarSesion(form.login, form.password).catch(() => {})
  }

  return (
    <section className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Iniciar sesion</h1>
        <label>
          Usuario
          <input
            type="text"
            value={form.login}
            onChange={(e) => setForm((prev) => ({ ...prev, login: e.target.value }))}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            required
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
