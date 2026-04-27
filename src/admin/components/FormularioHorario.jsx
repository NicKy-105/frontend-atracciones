import { useEffect, useState } from 'react'
import { adminApi } from '../../api/adminApi'

function FormularioHorario({ onGuardar, onCancelar }) {
  // Catálogos en cascada
  const [atracciones, setAtracciones] = useState([])
  const [tickets, setTickets] = useState([])
  const [cargandoAt, setCargandoAt] = useState(false)
  const [cargandoTck, setCargandoTck] = useState(false)

  // Formulario
  const [atGuid, setAtGuid] = useState('')
  const [form, setForm] = useState({
    tck_guid: '',
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    cupos_disponibles: '',
  })
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)

  // Carga atracciones al montar
  useEffect(() => {
    setCargandoAt(true)
    adminApi
      .listarAtraccionesAdmin({ page: 1, limit: 200 })
      .then((data) => setAtracciones(Array.isArray(data) ? data : []))
      .catch(() => setAtracciones([]))
      .finally(() => setCargandoAt(false))
  }, [])

  // Cuando cambia la atracción, carga sus tickets
  useEffect(() => {
    if (!atGuid) { setTickets([]); setForm((p) => ({ ...p, tck_guid: '' })); return }
    setCargandoTck(true)
    adminApi
      .listarTicketsDeAtraccion(atGuid)
      .then((data) => setTickets(Array.isArray(data) ? data : []))
      .catch(() => setTickets([]))
      .finally(() => setCargandoTck(false))
    setForm((p) => ({ ...p, tck_guid: '' }))
  }, [atGuid])

  const set = (campo) => (e) => {
    setForm((prev) => ({ ...prev, [campo]: e.target.value }))
    if (errores[campo]) setErrores((p) => ({ ...p, [campo]: '' }))
  }

  const validar = () => {
    const e = {}
    if (!atGuid) e.atGuid = 'Selecciona una atracción'
    if (!form.tck_guid) e.tck_guid = 'Selecciona un ticket'
    if (!form.fecha) e.fecha = 'La fecha es obligatoria'
    if (!form.hora_inicio) e.hora_inicio = 'La hora de inicio es obligatoria'
    if (!form.cupos_disponibles || Number(form.cupos_disponibles) < 1) e.cupos_disponibles = 'Cupos mínimo: 1'
    return e
  }

  const submit = async (event) => {
    event.preventDefault()
    const e = validar()
    if (Object.keys(e).length) { setErrores(e); return }
    setGuardando(true)
    const payload = {
      tck_guid: form.tck_guid,
      fecha: form.fecha,
      hora_inicio: form.hora_inicio,
      cupos_disponibles: Number(form.cupos_disponibles),
    }
    if (form.hora_fin) payload.hora_fin = form.hora_fin
    try {
      await onGuardar(payload)
    } finally {
      setGuardando(false)
    }
  }

  const getAtGuid = (item) => item.at_guid ?? item.atGuid ?? item.guid ?? item.id ?? ''
  const getTckGuid = (item) => item.tck_guid ?? item.guid ?? item.id ?? ''
  const getNombre = (item) => item.nombre ?? item.name ?? item.titulo ?? ''
  const getTckLabel = (item) => {
    const titulo = item.titulo ?? item.nombre ?? item.tipo ?? 'Ticket'
    const tipo = item.tipo_participante ?? item.tipoParticipante ?? ''
    const precio = item.precio != null ? ` — $${Number(item.precio).toFixed(2)}` : ''
    return `${titulo}${tipo ? ` (${tipo})` : ''}${precio}`
  }

  return (
    <form className="admin-form" onSubmit={submit} noValidate>

      {/* 1. Atracción */}
      <div className="form-group">
        <label htmlFor="fh-at">1. Atracción *</label>
        <select
          id="fh-at"
          value={atGuid}
          onChange={(e) => { setAtGuid(e.target.value); if (errores.atGuid) setErrores((p) => ({ ...p, atGuid: '' })) }}
          disabled={cargandoAt}
          className={errores.atGuid ? 'input-error' : ''}
        >
          <option value="">
            {cargandoAt ? 'Cargando atracciones...' : '— Selecciona una atracción —'}
          </option>
          {atracciones.map((item) => {
            const guid = getAtGuid(item)
            return <option key={guid} value={guid}>{getNombre(item)}</option>
          })}
        </select>
        {errores.atGuid && <span className="field-error">⚠ {errores.atGuid}</span>}
      </div>

      {/* 2. Ticket */}
      <div className="form-group">
        <label htmlFor="fh-tck">2. Ticket *</label>
        <select
          id="fh-tck"
          value={form.tck_guid}
          onChange={set('tck_guid')}
          disabled={!atGuid || cargandoTck}
          className={errores.tck_guid ? 'input-error' : ''}
        >
          <option value="">
            {!atGuid
              ? 'Primero selecciona una atracción'
              : cargandoTck
              ? 'Cargando tickets...'
              : tickets.length === 0
              ? 'Sin tickets — crea uno primero'
              : '— Selecciona un ticket —'}
          </option>
          {tickets.map((t) => {
            const guid = getTckGuid(t)
            return <option key={guid} value={guid}>{getTckLabel(t)}</option>
          })}
        </select>
        {errores.tck_guid && <span className="field-error">⚠ {errores.tck_guid}</span>}
      </div>

      {/* 3. Fecha */}
      <div className="form-group">
        <label htmlFor="fh-fecha">3. Fecha *</label>
        <input
          id="fh-fecha"
          type="date"
          value={form.fecha}
          onChange={set('fecha')}
          min={new Date().toISOString().slice(0, 10)}
          className={errores.fecha ? 'input-error' : ''}
        />
        {errores.fecha && <span className="field-error">⚠ {errores.fecha}</span>}
      </div>

      {/* 4. Hora inicio */}
      <div className="form-group">
        <label htmlFor="fh-hi">4. Hora de inicio *</label>
        <input
          id="fh-hi"
          type="time"
          value={form.hora_inicio}
          onChange={set('hora_inicio')}
          className={errores.hora_inicio ? 'input-error' : ''}
        />
        {errores.hora_inicio && <span className="field-error">⚠ {errores.hora_inicio}</span>}
      </div>

      {/* 5. Hora fin (opcional) */}
      <div className="form-group">
        <label htmlFor="fh-hf">5. Hora de fin <span className="text-muted">(opcional)</span></label>
        <input
          id="fh-hf"
          type="time"
          value={form.hora_fin}
          onChange={set('hora_fin')}
        />
      </div>

      {/* 6. Cupos */}
      <div className="form-group">
        <label htmlFor="fh-cupos">6. Cupos disponibles *</label>
        <input
          id="fh-cupos"
          type="number"
          min="1"
          value={form.cupos_disponibles}
          onChange={set('cupos_disponibles')}
          placeholder="ej. 20"
          className={errores.cupos_disponibles ? 'input-error' : ''}
        />
        {errores.cupos_disponibles && <span className="field-error">⚠ {errores.cupos_disponibles}</span>}
      </div>

      <div className="inline-form">
        <button className="btn" type="submit" disabled={guardando}>
          {guardando ? <><span className="spinner spinner-sm" /> Guardando...</> : 'Guardar horario'}
        </button>
        <button className="btn btn-outline" type="button" onClick={onCancelar} disabled={guardando}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default FormularioHorario
