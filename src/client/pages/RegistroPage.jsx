import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import * as authApi from '../../api/authApi'
import { adminApi } from '../../api/adminApi'
import ErrorMessage from '../../components/common/ErrorMessage'
import { useAuthContext } from '../../context/AuthContext'

const TIPOS_ID = ['CC', 'CEDULA', 'PASAPORTE', 'RUC', 'OTRO']

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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
  const [errores, setErrores] = useState({})
  const [cargando, setCargando] = useState(false)
  const [errorGlobal, setErrorGlobal] = useState('')

  if (estaAutenticado) return <Navigate to="/atracciones" replace />

  const set = (campo) => (e) => {
    setForm((prev) => ({ ...prev, [campo]: e.target.value }))
    if (errores[campo]) setErrores((prev) => ({ ...prev, [campo]: '' }))
  }

  const validar = () => {
    const e = {}
    if (!EMAIL_RE.test(form.loginEmail)) e.loginEmail = 'Ingresa un correo electrónico válido'
    if (!form.nombres.trim()) e.nombres = 'Los nombres son obligatorios'
    if (!form.apellidos.trim()) e.apellidos = 'Los apellidos son obligatorios'
    if (!form.numero_identificacion.trim()) e.numero_identificacion = 'El número de identificación es obligatorio'
    if (form.password.length < 6) e.password = 'La contraseña debe tener al menos 6 caracteres'
    if (form.password !== form.confirmarPassword) e.confirmarPassword = 'Las contraseñas no coinciden'
    return e
  }

  const submit = async (event) => {
    event.preventDefault()
    const e = validar()
    if (Object.keys(e).length) { setErrores(e); return }
    setErrores({})
    setCargando(true)
    setErrorGlobal('')
    try {
      const data = await authApi.registro(form.loginEmail, form.password)
      const token = data?.data?.token
      const usuarioLogin = data?.data?.login || form.loginEmail
      const roles = data?.data?.roles || []
      login(token, { login: usuarioLogin, roles })

      // Intentar crear perfil de cliente en segundo plano.
      // El endpoint /admin/clientes puede devolver 403 si el rol del token es CLIENTE;
      // en ese caso el backend ya habrá creado el perfil durante el registro.
      // El error es no-fatal: navegamos igualmente.
      adminApi.createCliente({
        login: usuarioLogin,
        nombres: form.nombres,
        apellidos: form.apellidos,
        correo: form.loginEmail,
        tipo_identificacion: form.tipo_identificacion,
        numero_identificacion: form.numero_identificacion,
        telefono: form.telefono || undefined,
      }).catch(() => {
        // Silencioso: el perfil se crea automáticamente en el backend o se puede editar desde /perfil
      })

      navigate(destino, { replace: true })
    } catch (err) {
      setErrorGlobal(err?.response?.data?.message || 'No se pudo completar el registro. Intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  const campo = (id, label, tipo = 'text', placeholder = '', opcional = false) => (
    <div className="form-group">
      <label htmlFor={id}>{label}{opcional && <span className="text-muted"> (opcional)</span>}</label>
      <input
        id={id}
        type={tipo}
        value={form[id]}
        onChange={set(id)}
        placeholder={placeholder}
        className={errores[id] ? 'input-error' : ''}
        autoComplete={tipo === 'password' ? 'new-password' : id}
      />
      {errores[id] && <span className="field-error">⚠ {errores[id]}</span>}
    </div>
  )

  return (
    <section className="auth-page" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div className="auth-card fade-in" style={{ maxWidth: 560 }}>
        <h1>Crear cuenta</h1>
        <p className="auth-subtitle">Completa tus datos para registrarte.</p>

        <form onSubmit={submit} className="form-grid" noValidate>
          {campo('loginEmail', 'Correo electrónico', 'email', 'correo@ejemplo.com')}

          <div className="form-grid form-grid-2">
            {campo('nombres', 'Nombres', 'text', 'Juan Carlos')}
            {campo('apellidos', 'Apellidos', 'text', 'Pérez López')}
          </div>

          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label htmlFor="tipo_identificacion">Tipo de identificación</label>
              <select id="tipo_identificacion" value={form.tipo_identificacion} onChange={set('tipo_identificacion')}>
                {TIPOS_ID.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {campo('numero_identificacion', 'Número de identificación', 'text', '1234567890')}
          </div>

          {campo('telefono', 'Teléfono', 'tel', '+593 99 000 0000', true)}

          <hr className="divider" />

          {campo('password', 'Contraseña', 'password', '••••••••')}
          {campo('confirmarPassword', 'Confirmar contraseña', 'password', '••••••••')}

          <ErrorMessage mensaje={errorGlobal} />

          <button type="submit" className="btn btn-full" disabled={cargando}>
            {cargando ? (
              <><span className="spinner spinner-sm" /> Registrando...</>
            ) : 'Crear cuenta'}
          </button>
        </form>

        <p className="auth-footer">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </section>
  )
}

export default RegistroPage
