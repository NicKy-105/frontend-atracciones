import { useEffect, useState } from 'react'
import { adminApi } from '../../api/adminApi'
import ErrorMessage from '../../components/common/ErrorMessage'
import Spinner from '../../components/common/Spinner'
import { emitirToast } from '../../components/common/Toast'

const VACIO = { nombre: '', pais: '' }

function GestionDestinosPage() {
  const [items, setItems] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(VACIO)
  const [editando, setEditando] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [errores, setErrores] = useState({})
  const [mostrarForm, setMostrarForm] = useState(false)

  const cargar = async () => {
    setCargando(true)
    setError('')
    try {
      const data = await adminApi.listDestinos()
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudieron cargar los destinos.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const set = (campo) => (e) => {
    setForm((p) => ({ ...p, [campo]: e.target.value }))
    if (errores[campo]) setErrores((p) => ({ ...p, [campo]: '' }))
  }

  const validar = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio'
    return e
  }

  const handleNuevo = () => {
    setEditando(null)
    setForm(VACIO)
    setErrores({})
    setMostrarForm(true)
  }

  const handleEditar = (item) => {
    setEditando(item)
    setForm({ nombre: item.nombre ?? '', pais: item.pais ?? '' })
    setErrores({})
    setMostrarForm(true)
  }

  const handleGuardar = async (e) => {
    e.preventDefault()
    const errs = validar()
    if (Object.keys(errs).length) { setErrores(errs); return }
    setGuardando(true)
    try {
      const payload = { nombre: form.nombre.trim(), pais: form.pais.trim() || null }
      if (editando) {
        await adminApi.updateDestino(editando.des_guid ?? editando.guid, payload)
        emitirToast('Destino actualizado correctamente.', 'success')
      } else {
        await adminApi.createDestino(payload)
        emitirToast('Destino creado correctamente.', 'success')
      }
      setMostrarForm(false)
      await cargar()
    } catch (err) {
      emitirToast(err?.response?.data?.message || 'No se pudo guardar el destino.', 'error')
    } finally {
      setGuardando(false)
    }
  }

  const handleEliminar = async (item) => {
    if (!window.confirm(`¿Eliminar el destino "${item.nombre}"?`)) return
    try {
      await adminApi.deleteDestino(item.des_guid ?? item.guid)
      emitirToast('Destino eliminado.', 'success')
      await cargar()
    } catch (err) {
      emitirToast(err?.response?.data?.message || 'No se pudo eliminar el destino.', 'error')
    }
  }

  return (
    <section className="page-section">
      <div className="admin-page-header">
        <h1>Gestión de Destinos</h1>
        <button className="btn" type="button" onClick={handleNuevo}>Nuevo destino</button>
      </div>

      {mostrarForm && (
        <form className="admin-form" onSubmit={handleGuardar} noValidate style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>{editando ? 'Editar destino' : 'Nuevo destino'}</h3>
          <div className="form-group">
            <label htmlFor="dest-nombre">Nombre *</label>
            <input id="dest-nombre" type="text" value={form.nombre} onChange={set('nombre')}
              placeholder="ej. Quito" className={errores.nombre ? 'input-error' : ''} />
            {errores.nombre && <span className="field-error">⚠ {errores.nombre}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="dest-pais">País</label>
            <input id="dest-pais" type="text" value={form.pais} onChange={set('pais')} placeholder="ej. Ecuador" />
          </div>
          <div className="inline-form" style={{ marginTop: '0.75rem' }}>
            <button className="btn" type="submit" disabled={guardando}>
              {guardando ? <><span className="spinner spinner-sm" /> Guardando...</> : 'Guardar'}
            </button>
            <button className="btn btn-outline" type="button" onClick={() => setMostrarForm(false)} disabled={guardando}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {cargando && <Spinner message="Cargando destinos..." />}
      <ErrorMessage mensaje={error} />

      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Nombre</th><th>País</th><th>Estado</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {items.length === 0 && !cargando && (
              <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                No hay destinos registrados.
              </td></tr>
            )}
            {items.map((item) => (
              <tr key={item.des_guid ?? item.guid}>
                <td>{item.nombre}</td>
                <td>{item.pais ?? '—'}</td>
                <td>{item.estado ?? 'ACTIVO'}</td>
                <td>
                  <button className="btn btn-outline btn-sm" style={{ marginRight: '0.5rem' }} onClick={() => handleEditar(item)}>Editar</button>
                  <button className="btn btn-outline btn-sm" style={{ color: 'var(--danger, #e55)' }} onClick={() => handleEliminar(item)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default GestionDestinosPage
