import { useEffect, useState } from 'react'
import { adminApi } from '../../api/adminApi'
import Spinner from '../../components/common/Spinner'

const TIPOS_PARTICIPANTE = ['Adulto', 'Niño', 'Grupo', 'Estudiante', 'Senior']

function FormularioTicket({ inicial, onGuardar, onCancelar }) {
  const [form, setForm] = useState({
    atGuid: '',
    titulo: '',
    precio: '',
    tipoParticipante: 'Adulto',
    capacidadMaxima: '',
    cuposDisponibles: '',
  })
  const [errores, setErrores] = useState({})
  const [atracciones, setAtracciones] = useState([])
  const [cargando, setCargando] = useState(false)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    setCargando(true)
    adminApi
      .listarAtraccionesAdmin({ page: 1, limit: 200 })
      .then((data) => {
        // El campo GUID puede ser at_guid, guid, atGuid según la versión del backend
        const items = Array.isArray(data) ? data : []
        setAtracciones(items)
      })
      .catch(() => setAtracciones([]))
      .finally(() => setCargando(false))
  }, [])

  useEffect(() => {
    if (!inicial) return
    setForm({
      atGuid: inicial.at_guid ?? inicial.atGuid ?? inicial.guid ?? '',
      titulo: inicial.titulo ?? inicial.nombre ?? '',
      precio: inicial.precio ?? '',
      tipoParticipante: inicial.tipo_participante ?? inicial.tipoParticipante ?? 'Adulto',
      capacidadMaxima: inicial.capacidad_maxima ?? inicial.capacidadMaxima ?? '',
      cuposDisponibles: inicial.cupos_disponibles ?? inicial.cuposDisponibles ?? '',
    })
  }, [inicial])

  const set = (campo) => (e) => {
    setForm((p) => ({ ...p, [campo]: e.target.value }))
    if (errores[campo]) setErrores((p) => ({ ...p, [campo]: '' }))
  }

  const validar = () => {
    const e = {}
    if (!form.atGuid) e.atGuid = 'Selecciona una atracción'
    if (!form.titulo.trim()) e.titulo = 'El título es obligatorio'
    if (!form.precio || Number(form.precio) < 0) e.precio = 'Ingresa un precio válido (≥ 0)'
    if (!form.capacidadMaxima || Number(form.capacidadMaxima) < 1) e.capacidadMaxima = 'Capacidad mínima: 1'
    if (form.cuposDisponibles === '' || Number(form.cuposDisponibles) < 0) e.cuposDisponibles = 'Cupos debe ser ≥ 0'
    return e
  }

  const submit = async (event) => {
    event.preventDefault()
    const e = validar()
    if (Object.keys(e).length) { setErrores(e); return }
    setGuardando(true)
    try {
      await onGuardar({
        atGuid: form.atGuid,
        titulo: form.titulo.trim(),
        precio: Number(form.precio),
        tipoParticipante: form.tipoParticipante,
        capacidadMaxima: Number(form.capacidadMaxima),
        cuposDisponibles: Number(form.cuposDisponibles),
      })
    } finally {
      setGuardando(false)
    }
  }

  /** Normaliza el GUID de un item de atracción (puede venir en distintos campos) */
  const getAtGuid = (item) =>
    item.at_guid ?? item.atGuid ?? item.guid ?? item.id ?? ''

  const getNombre = (item) =>
    item.nombre ?? item.name ?? item.titulo ?? ''

  return (
    <form className="admin-form" onSubmit={submit} noValidate>

      {/* Atracción */}
      <div className="form-group">
        <label htmlFor="ft-atraccion">Atracción *</label>
        {cargando ? (
          <Spinner message="Cargando atracciones..." />
        ) : (
          <select
            id="ft-atraccion"
            value={form.atGuid}
            onChange={set('atGuid')}
            className={errores.atGuid ? 'input-error' : ''}
          >
            <option value="">— Selecciona una atracción —</option>
            {atracciones.map((item) => {
              const guid = getAtGuid(item)
              return (
                <option key={guid} value={guid}>
                  {getNombre(item)}
                </option>
              )
            })}
          </select>
        )}
        {errores.atGuid && <span className="field-error">⚠ {errores.atGuid}</span>}
        {!cargando && atracciones.length === 0 && (
          <span className="field-error" style={{ color: 'var(--text-muted)' }}>
            No se encontraron atracciones. Crea una primero.
          </span>
        )}
      </div>

      {/* Título */}
      <div className="form-group">
        <label htmlFor="ft-titulo">Título del ticket *</label>
        <input
          id="ft-titulo"
          type="text"
          value={form.titulo}
          onChange={set('titulo')}
          placeholder="ej. Adulto — entrada general"
          className={errores.titulo ? 'input-error' : ''}
        />
        {errores.titulo && <span className="field-error">⚠ {errores.titulo}</span>}
      </div>

      {/* Tipo de participante */}
      <div className="form-group">
        <label htmlFor="ft-tipo">Tipo de participante</label>
        <select id="ft-tipo" value={form.tipoParticipante} onChange={set('tipoParticipante')}>
          {TIPOS_PARTICIPANTE.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Precio */}
      <div className="form-group">
        <label htmlFor="ft-precio">Precio ($) *</label>
        <input
          id="ft-precio"
          type="number"
          min="0"
          step="0.01"
          value={form.precio}
          onChange={set('precio')}
          placeholder="0.00"
          className={errores.precio ? 'input-error' : ''}
        />
        {errores.precio && <span className="field-error">⚠ {errores.precio}</span>}
      </div>

      {/* Capacidad máxima */}
      <div className="form-group">
        <label htmlFor="ft-cap">Capacidad máxima *</label>
        <input
          id="ft-cap"
          type="number"
          min="1"
          value={form.capacidadMaxima}
          onChange={set('capacidadMaxima')}
          placeholder="ej. 20"
          className={errores.capacidadMaxima ? 'input-error' : ''}
        />
        {errores.capacidadMaxima && <span className="field-error">⚠ {errores.capacidadMaxima}</span>}
      </div>

      {/* Cupos disponibles */}
      <div className="form-group">
        <label htmlFor="ft-cupos">Cupos disponibles *</label>
        <input
          id="ft-cupos"
          type="number"
          min="0"
          value={form.cuposDisponibles}
          onChange={set('cuposDisponibles')}
          placeholder="ej. 15"
          className={errores.cuposDisponibles ? 'input-error' : ''}
        />
        {errores.cuposDisponibles && <span className="field-error">⚠ {errores.cuposDisponibles}</span>}
      </div>

      <div className="inline-form">
        <button className="btn" type="submit" disabled={guardando || cargando}>
          {guardando ? <><span className="spinner spinner-sm" /> Guardando...</> : 'Guardar'}
        </button>
        <button className="btn btn-outline" type="button" onClick={onCancelar} disabled={guardando}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default FormularioTicket
