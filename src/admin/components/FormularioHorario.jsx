import { useEffect, useState } from 'react'

function FormularioHorario({ inicial, onGuardar, onCancelar }) {
  const [form, setForm] = useState({
    tck_guid: '',
    fecha_hora: '',
    cupos: '',
  })

  useEffect(() => {
    if (inicial) {
      setForm({
        tck_guid: inicial.tck_guid || '',
        fecha_hora: inicial.fecha_hora || '',
        cupos: inicial.cupos || '',
      })
    }
  }, [inicial])

  const submit = async (event) => {
    event.preventDefault()
    await onGuardar({ ...form, cupos: Number(form.cupos) })
  }

  return (
    <form className="admin-form" onSubmit={submit}>
      <input
        placeholder="tck_guid"
        value={form.tck_guid}
        onChange={(e) => setForm((p) => ({ ...p, tck_guid: e.target.value }))}
        required
      />
      <input
        placeholder="fecha_hora"
        value={form.fecha_hora}
        onChange={(e) => setForm((p) => ({ ...p, fecha_hora: e.target.value }))}
        required
      />
      <input
        placeholder="cupos"
        type="number"
        min="0"
        value={form.cupos}
        onChange={(e) => setForm((p) => ({ ...p, cupos: e.target.value }))}
      />
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
