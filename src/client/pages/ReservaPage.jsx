import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import ErrorMessage from '../../components/common/ErrorMessage'
import Spinner from '../../components/common/Spinner'
import { useAtracciones } from '../hooks/useAtracciones'
import { useReserva } from '../hooks/useReserva'

function ConfirmacionReserva({ reserva }) {
  return (
    <section className="page-section">
      <div className="reserva-card">
        <h1>¡Reserva confirmada!</h1>
        <p>
          <strong>Código:</strong> {reserva.rev_codigo}
        </p>
        <p>
          <strong>Atracción:</strong> {reserva.atraccion_nombre}
        </p>
        <p>
          <strong>Fecha:</strong> {reserva.hor_fecha}
        </p>
        <p>
          <strong>Horario:</strong> {reserva.hor_hora_inicio}
        </p>
        <p>
          <strong>Subtotal:</strong> ${Number(reserva.rev_subtotal ?? 0).toFixed(2)}
        </p>
        <p>
          <strong>IVA (15%):</strong> ${Number(reserva.rev_valor_iva ?? 0).toFixed(2)}
        </p>
        <p>
          <strong>Total:</strong> ${Number(reserva.rev_total ?? 0).toFixed(2)}
        </p>
        {(reserva.detalle || []).length > 0 && (
          <>
            <h3>Detalle</h3>
            <ul>
              {reserva.detalle.map((linea, idx) => (
                <li key={linea.tck_guid || idx}>
                  {linea.tipo || linea.ticket_nombre} — {linea.cantidad} x $
                  {Number(linea.precio_unitario ?? 0).toFixed(2)}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  )
}

function ReservaPage() {
  const { guid } = useParams()
  const [horGuid, setHorGuid] = useState('')
  const [cantidades, setCantidades] = useState({})
  const { detalle, cargarDetalle, cargando, error } = useAtracciones({})
  const { crearReserva, reservaCreada, error: errorReserva, cargando: creando } = useReserva()

  useEffect(() => {
    cargarDetalle(guid)
      .then((data) => {
        // horarios_proximos son informativos; el hor_guid viene de cada horario
        const primero = data?.horarios_proximos?.[0]
        if (primero?.hor_guid) setHorGuid(primero.hor_guid)
      })
      .catch(() => {})
  }, [guid, cargarDetalle])

  // tck_guid es la clave de cada ticket en el objeto cantidades
  const lineas = useMemo(
    () =>
      Object.entries(cantidades)
        .filter(([, cantidad]) => Number(cantidad) > 0)
        .map(([tck_guid, cantidad]) => ({ tck_guid, cantidad: Number(cantidad) })),
    [cantidades],
  )

  const subtotal = useMemo(() => {
    if (!detalle?.tickets) return 0
    return detalle.tickets.reduce((acc, ticket) => {
      const cantidad = Number(cantidades[ticket.tck_guid] || 0)
      return acc + cantidad * Number(ticket.precio || 0)
    }, 0)
  }, [cantidades, detalle?.tickets])

  const iva = subtotal * 0.15
  const total = subtotal + iva

  const handleSubmit = async (event) => {
    event.preventDefault()
    await crearReserva(horGuid, lineas, 'web').catch(() => {})
  }

  if (cargando && !detalle && !error) return <Spinner message="Cargando atraccion..." />

  if (reservaCreada) {
    return <ConfirmacionReserva reserva={reservaCreada} />
  }

  return (
    <section className="page-section">
      <h1>Reservar {detalle?.nombre}</h1>
      <ErrorMessage mensaje={error || errorReserva} />
      <form className="reserva-form" onSubmit={handleSubmit}>
        <label>
          Horario disponible
          <select value={horGuid} onChange={(e) => setHorGuid(e.target.value)} required>
            <option value="">Seleccione horario</option>
            {(detalle?.horarios_proximos || []).map((horario, index) => (
              <option
                key={horario.hor_guid || index}
                value={horario.hor_guid}
              >
                {horario.fecha} {horario.hora_inicio}
                {horario.cupos != null ? ` — ${horario.cupos} cupos` : ''}
              </option>
            ))}
          </select>
        </label>

        <div className="tickets-box">
          {(detalle?.tickets || []).map((ticket) => (
            <label key={ticket.tck_guid}>
              {ticket.tipo} (${ticket.precio})
              <input
                type="number"
                min="0"
                value={cantidades[ticket.tck_guid] || 0}
                onChange={(e) =>
                  setCantidades((prev) => ({ ...prev, [ticket.tck_guid]: e.target.value }))
                }
              />
            </label>
          ))}
        </div>

        <div className="totales">
          <p>Subtotal: ${subtotal.toFixed(2)}</p>
          <p>IVA 15%: ${iva.toFixed(2)}</p>
          <p>Total: ${total.toFixed(2)}</p>
        </div>

        <button type="submit" className="btn" disabled={creando || !horGuid || !lineas.length}>
          {creando ? 'Procesando...' : 'Confirmar reserva'}
        </button>
      </form>
    </section>
  )
}

export default ReservaPage
