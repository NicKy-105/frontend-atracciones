import { useEffect, useState } from 'react'
import { adminApi } from '../../api/adminApi'
import ErrorMessage from '../../components/common/ErrorMessage'
import Spinner from '../../components/common/Spinner'
import { emitirToast } from '../../components/common/Toast'

function GestionCategoriasPage() {
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
      const data = await adminApi.listarCategorias()
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudieron cargar las categorías.')
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
      const guid = editando?.cat_guid ?? editando?.guid
      if (editando) {
        await adminApi.updateCategoria(guid, payload)
        emitirToast('Categoría actualizada correctamente.', 'success')
      } else {
        await adminApi.createCategoria(payload)
        emitirToast('Categoría creada correctamente.', 'success')
      }
      setMostrarForm(false)
      await cargar()
    } catch (err) {
      emitirToast(err?.response?.data?.message || 'No se pudo guardar la categoría.', 'error')
    } finally {
      setGuardando(false)
    }
  }

  const handleEliminar = async (item) => {
    if (!window.confirm(`¿Eliminar la categoría "${item.nombre ?? item.descripcion}"?`)) return
    try {
      await adminApi.deleteCategoria(item.cat_guid ?? item.guid)
      emitirToast('Categoría eliminada.', 'success')
      await cargar()
    } catch (err) {
      emitirToast(err?.response?.data?.message || 'No se pudo eliminar la categoría.', 'error')
    }
  }

  return (
    <section className="page-section">
      <div className="admin-page-header">
        <h1>Gestión de Categorías</h1>
        <button className="btn" type="button" onClick={handleNuevo}>Nueva categoría</button>
      </div>

      {mostrarForm && (
        <form className="admin-form" onSubmit={handleGuardar} noValidate style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>{editando ? 'Editar categoría' : 'Nueva categoría'}</h3>
          <div className="form-group">
            <label htmlFor="cat-nombre">Nombre *</label>
            <input id="cat-nombre" type="text" value={nombre}
              onChange={(e) => { setNombre(e.target.value); setErrorNombre('') }}
              placeholder="ej. Aventura"
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

      {cargando && <Spinner message="Cargando categorías..." />}
      <ErrorMessage mensaje={error} />

      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Nombre</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {items.length === 0 && !cargando && (
              <tr><td colSpan={2} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                No hay categorías registradas.
              </td></tr>
            )}
            {items.map((item) => (
              <tr key={item.cat_guid ?? item.guid}>
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

export default GestionCategoriasPage
