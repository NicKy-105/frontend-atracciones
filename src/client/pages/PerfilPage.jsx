import { useEffect, useState } from 'react'
import { apiClient } from '../../api/atraccionesApi'
import ErrorMessage from '../../components/common/ErrorMessage'
import Spinner from '../../components/common/Spinner'

function PerfilPage() {
  const [perfil, setPerfil] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [exito, setExito] = useState('')
  const [form, setForm] = useState({
    correo: '',
    telefono: '',
    direccion: '',
  })

  useEffect(() => {
    setCargando(true)
    apiClient
      .get('/clientes/perfil')
      .then((response) => {
        const data = response.data?.data || response.data
        setPerfil(data)
        setForm({
          correo: data?.correo || '',
          telefono: data?.telefono || '',
          direccion: data?.direccion || '',
        })
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'No se pudo cargar el perfil')
      })
      .finally(() => setCargando(false))
  }, [])

  const set = (campo) => (e) => setForm((prev) => ({ ...prev, [campo]: e.target.value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setGuardando(true)
    setError('')
    setExito('')
    try {
      await apiClient.put('/clientes/perfil', form)
      setExito('Perfil actualizado correctamente')
      setTimeout(() => setExito(''), 4000)
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo actualizar el perfil')
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) return <Spinner message="Cargando perfil..." />

  return (
    <section className="page-section">
      <h1>Mi Perfil</h1>
      <ErrorMessage mensaje={error} />
      {exito && <p className="success-message">{exito}</p>}

      {perfil && (
        <div className="reserva-card" style={{ marginBottom: '1.5rem' }}>
          <p>
            <strong>Nombre:</strong> {perfil.nombres} {perfil.apellidos}
          </p>
          <p>
            <strong>Tipo ID:</strong> {perfil.tipo_identificacion}
          </p>
          <p>
            <strong>Número ID:</strong> {perfil.numero_identificacion}
          </p>
        </div>
      )}

      <form className="reserva-form" onSubmit={handleSubmit}>
        <h2>Actualizar datos de contacto</h2>
        <label>
          Correo electrónico
          <input type="email" value={form.correo} onChange={set('correo')} />
        </label>
        <label>
          Teléfono
          <input type="tel" value={form.telefono} onChange={set('telefono')} />
        </label>
        <label>
          Dirección
          <input type="text" value={form.direccion} onChange={set('direccion')} />
        </label>
        <button type="submit" className="btn" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </section>
  )
}

export default PerfilPage
