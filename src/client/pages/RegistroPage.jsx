import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import * as authApi from '../../api/authApi'
import ErrorMessage from '../../components/common/ErrorMessage'
import { useAuthContext } from '../../context/AuthContext'

function RegistroPage() {
  const navigate = useNavigate()
  const { estaAutenticado, login } = useAuthContext()
  const [form, setForm] = useState({
    login: '',
    password: '',
    confirmarPassword: '',
  })
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  if (estaAutenticado) {
    return <Navigate to="/atracciones" replace />
  }

  const submit = async (event) => {
    event.preventDefault()
    if (form.password !== form.confirmarPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setCargando(true)
    setError('')
    try {
      const data = await authApi.registro(form.login, form.password)
      login(data?.data?.token, {
        login: data?.data?.login || form.login,
        roles: data?.data?.roles || [],
      })
      navigate('/atracciones')
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo completar el registro')
    } finally {
      setCargando(false)
    }
  }

  return (
    <section className="auth-page">
      <form className="auth-form" onSubmit={submit}>
        <h1>Registrarse</h1>
        <label>
          Correo
          <input
            type="email"
            value={form.login}
            onChange={(e) => setForm((prev) => ({ ...prev, login: e.target.value }))}
            required
          />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            required
          />
        </label>
        <label>
          Confirmar contraseña
          <input
            type="password"
            value={form.confirmarPassword}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, confirmarPassword: e.target.value }))
            }
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
