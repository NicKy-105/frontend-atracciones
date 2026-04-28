import { useEffect, useState } from 'react'
import { adminApi } from '../../api/adminApi'
import ErrorMessage from '../../components/common/ErrorMessage'
import Spinner from '../../components/common/Spinner'
import { emitirToast } from '../../components/common/Toast'

function GestionIncluyePage() {
  const [items, setItems] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [nombre, setNombre] = useState('')
  const [editando, setEditando] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [errorNombre, setErrorNombre] = useState('')
  const [mostrarForm, setMostrarForm] = useState(false)

  const cargar = async () => {
    setCargando(true)
    setError('')
    try {
      const data = await adminApi.listarIncluye()
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudieron cargar los elementos incluidos.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const handleNuevo = () => {
    setEditando(null)
    setNombre('')
    setErrorNombre('')
    setMostrarForm(true)
  }

  const handleEditar = (item) => {
    setEditando(item)
    setNombre(item.nombre ?? item.descripcion ?? '')
    setErrorNombre('')
    setMostrarForm(true)
  }

  const handleGuardar = async (e) => {
    e.preventDefault()
    if (!nombre.trim()) { setErrorNombre('El nombre es obligatorio'); return }
    setGuardando(true)
    try {
      const payload = { nombre: nombre.trim() }
      const guid = editando?.inc_guid ?? editando?.guid
      if (editando) {
        await adminApi.updateIncluye(guid, payload)
        emitirToast('Elemento actualizado correctamente.', 'success')
      } else {
        await adminApi.createIncluye(payload)
        emitirToast('Elemento creado correctamente.', 'success')
      }
      setMostrarForm(false)
      await cargar()
    } catch (err) {
      emitirToast(err?.response?.data?.message || 'No se pudo guardar el elemento.', 'error')
    } finally {
      setGuardando(false)
    }
  }

  const handleEliminar = async (item) => {
    if (!window.confirm(`¿Eliminar "${item.nombre ?? item.descripcion}"?`)) return
    try {
      await adminApi.deleteIncluye(item.inc_guid ?? item.guid)
      emitirToast('Elemento eliminado.', 'success')
      await cargar()
    } catch (err) {
      emitirToast(err?.response?.data?.message || 'No se pudo eliminar el elemento.', 'error')
    }
  }

  return (
    <section className="page-section">
      <div className="admin-page-header">
        <h1>Gestión de Elementos Incluidos</h1>
        <button className="btn" type="button" onClick={handleNuevo}>Nuevo elemento</button>
      </div>

      {mostrarForm && (
        <form className="admin-form" onSubmit={handleGuardar} noValidate style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>{editando ? 'Editar elemento' : 'Nuevo elemento'}</h3>
          <div className="form-group">
            <label htmlFor="inc-nombre">Nombre *</label>
            <input id="inc-nombre" type="text" value={nombre}
              onChange={(e) => { setNombre(e.target.value); setErrorNombre('') }}
              placeholder="ej. Guía bilingüe"
              className={errorNombre ? 'input-error' : ''} />
            {errorNombre && <span className="field-error">⚠ {errorNombre}</span>}
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

      {cargando && <Spinner message="Cargando elementos..." />}
      <ErrorMessage mensaje={error} />

      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Nombre</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {items.length === 0 && !cargando && (
              <tr><td colSpan={2} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                No hay elementos registrados.
              </td></tr>
            )}
            {items.map((item) => (
              <tr key={item.inc_guid ?? item.guid}>
                <td>{item.nombre ?? item.descripcion}</td>
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

export default GestionIncluyePage
