import { useEffect, useState } from 'react'
import { adminApi } from '../../api/adminApi'

function FormularioTicket({ inicial, onGuardar, onCancelar }) {
  const [form, setForm] = useState({
    atGuid: '',
    titulo: '',
    precio: '',
    tipoParticipante: 'Adulto',
    capacidadMaxima: '',
    cuposDisponibles: '',
  })
  const [atracciones, setAtracciones] = useState([])

  useEffect(() => {
    adminApi
      .listarAtraccionesAdmin({ page: 1, limit: 200 })
      .then((data) => setAtracciones(data))
      .catch(() => setAtracciones([]))
  }, [])

  useEffect(() => {
    if (inicial) {
      setForm({
        atGuid: inicial.atGuid || inicial.at_guid || '',
        titulo: inicial.titulo || inicial.nombre || '',
        precio: inicial.precio || '',
        tipoParticipante: inicial.tipoParticipante || 'Adulto',
        capacidadMaxima: inicial.capacidadMaxima || '',
        cuposDisponibles: inicial.cuposDisponibles || '',
      })
    }
  }, [inicial])

  const submit = async (event) => {
    event.preventDefault()
    await onGuardar({
      atGuid: form.atGuid,
      titulo: form.titulo,
      precio: Number(form.precio),
      tipoParticipante: form.tipoParticipante,
      capacidadMaxima: Number(form.capacidadMaxima),
      cuposDisponibles: Number(form.cuposDisponibles),
    })
  }

  return (
    <form className="admin-form" onSubmit={submit}>
      <select
        value={form.atGuid}
        onChange={(e) => setForm((p) => ({ ...p, atGuid: e.target.value }))}
        required
      >
        <option value="">Seleccione una atraccion</option>
        {atracciones.map((item) => (
          <option key={item.guid || item.atGuid} value={item.guid || item.atGuid}>
            {item.nombre}
          </option>
        ))}
      </select>
      <input
        placeholder="Titulo"
        value={form.titulo}
        onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))}
        required
      />
      <input
        placeholder="Precio"
        type="number"
        min="0"
        value={form.precio}
        onChange={(e) => setForm((p) => ({ ...p, precio: e.target.value }))}
        required
      />
      <select
        value={form.tipoParticipante}
        onChange={(e) => setForm((p) => ({ ...p, tipoParticipante: e.target.value }))}
      >
        <option value="Adulto">Adulto</option>
        <option value="Niño">Niño</option>
        <option value="Grupo">Grupo</option>
        <option value="Estudiante">Estudiante</option>
        <option value="Senior">Senior</option>
      </select>
      <input
        placeholder="Capacidad maxima"
        type="number"
        min="1"
        value={form.capacidadMaxima}
        onChange={(e) => setForm((p) => ({ ...p, capacidadMaxima: e.target.value }))}
        required
      />
      <input
        placeholder="Cupos disponibles"
        type="number"
        min="0"
        value={form.cuposDisponibles}
        onChange={(e) => setForm((p) => ({ ...p, cuposDisponibles: e.target.value }))}
        required
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

export default FormularioTicket
