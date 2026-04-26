import { useState } from 'react'

function FormularioHorario({ onGuardar, onCancelar }) {
  const [form, setForm] = useState({
    tck_guid: '',
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    cupos_disponibles: '',
  })

  const set = (campo) => (e) =>
    setForm((prev) => ({ ...prev, [campo]: e.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    const payload = {
      tck_guid: form.tck_guid,
      fecha: form.fecha,
      hora_inicio: form.hora_inicio,
      cupos_disponibles: Number(form.cupos_disponibles),
    }
    if (form.hora_fin) payload.hora_fin = form.hora_fin
    await onGuardar(payload)
  }

  return (
    <form className="admin-form" onSubmit={submit}>
      <label>
        GUID del ticket (tck_guid)
        <input
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          value={form.tck_guid}
          onChange={set('tck_guid')}
          required
        />
      </label>

      <label>
        Fecha (YYYY-MM-DD)
        <input
          type="date"
          value={form.fecha}
          onChange={set('fecha')}
          required
        />
      </label>

      <label>
        Hora de inicio (HH:mm)
        <input
          type="time"
          value={form.hora_inicio}
          onChange={set('hora_inicio')}
          required
        />
      </label>

      <label>
        Hora de fin (opcional)
        <input
          type="time"
          value={form.hora_fin}
          onChange={set('hora_fin')}
        />
      </label>

      <label>
        Cupos disponibles
        <input
          type="number"
          min="1"
          value={form.cupos_disponibles}
          onChange={set('cupos_disponibles')}
          required
        />
      </label>

      <div className="inline-form">
        <button className="btn" type="submit">
          Guardar
        </button>
        <button className="btn btn-outline" type="button" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default FormularioHorario
