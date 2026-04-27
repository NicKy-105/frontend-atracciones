import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ErrorMessage from '../../components/common/ErrorMessage'
import Spinner from '../../components/common/Spinner'
import { useAtracciones } from '../hooks/useAtracciones'
import { useReserva } from '../hooks/useReserva'

function ConfirmacionReserva({ reserva }) {
  const rows = [
    ['Código', reserva.rev_codigo],
    ['Atracción', reserva.atraccion_nombre],
    reserva.hor_fecha && ['Fecha', reserva.hor_fecha],
    reserva.hor_hora_inicio && ['Horario', reserva.hor_hora_inicio],
    ['Subtotal', `$${Number(reserva.rev_subtotal ?? 0).toFixed(2)}`],
    ['IVA (15%)', `$${Number(reserva.rev_valor_iva ?? 0).toFixed(2)}`],
    ['Total', `$${Number(reserva.rev_total ?? 0).toFixed(2)}`],
  ].filter(Boolean)

  return (
    <section className="page-section">
      <div className="confirmacion-card fade-in">
        <div className="check-icon">✅</div>
        <h1>¡Reserva confirmada!</h1>

        {rows.map(([etiqueta, valor]) => (
          <div className="confirmacion-row" key={etiqueta}>
            <span>{etiqueta}</span>
            <span>{valor}</span>
          </div>
        ))}

        {(reserva.detalle || []).length > 0 && (
          <>
            <p style={{ marginTop: '1rem', fontWeight: 600, fontSize: '0.9rem' }}>Detalle de tickets</p>
            {reserva.detalle.map((linea, idx) => (
              <div className="confirmacion-row" key={linea.tck_guid || idx}>
                <span>{linea.tck_tipo_participante || linea.tipo || 'Ticket'}</span>
                <span>{linea.cantidad} × ${Number(linea.precio_unit ?? linea.precio_unitario ?? 0).toFixed(2)}</span>
              </div>
            ))}
          </>
        )}

        <div className="inline-form" style={{ marginTop: '1.75rem' }}>
          <Link to="/mis-reservas" className="btn">Ver mis reservas</Link>
          <Link to="/atracciones" className="btn btn-outline">Volver al catálogo</Link>
        </div>
      </div>
    </section>
  )
}

function ReservaPage() {
  const { guid } = useParams()
  const [horGuid, setHorGuid] = useState('')
  const [cantidades, setCantidades] = useState({})
  const [intentoEnvio, setIntentoEnvio] = useState(false)
  const { detalle, cargarDetalle, cargando, error } = useAtracciones({})
  const { crearReserva, reservaCreada, error: errorReserva, cargando: creando } = useReserva()

  useEffect(() => {
    cargarDetalle(guid).catch(() => {})
  }, [guid, cargarDetalle])

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
  const sinTickets = lineas.length === 0
  const sinHorario = !horGuid

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIntentoEnvio(true)
    if (sinHorario || sinTickets) return
    await crearReserva(horGuid, lineas, 'web').catch(() => {})
  }

  if (cargando && !detalle && !error) return <Spinner message="Cargando atracción..." />
  if (reservaCreada) return <ConfirmacionReserva reserva={reservaCreada} />

  const sinHorarios = !cargando && detalle && (detalle.horarios_proximos || []).length === 0

  return (
    <section className="page-section">
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to={`/atracciones/${guid}`} className="text-muted text-sm">← Volver al detalle</Link>
        <h1 style={{ marginTop: '0.5rem' }}>Reservar: {detalle?.nombre}</h1>
      </div>

      <ErrorMessage mensaje={error || errorReserva} />

      {sinHorarios && (
        <div className="info-message">
          No hay horarios disponibles en los próximos 7 días. Vuelve pronto.
        </div>
      )}

      {!sinHorarios && detalle && (
        <form className="reserva-form" onSubmit={handleSubmit} noValidate>

          {/* Horario */}
          <div className="form-group">
            <label htmlFor="horario">Selecciona un horario *</label>
            <select
              id="horario"
              value={horGuid}
              onChange={(e) => { setHorGuid(e.target.value); setIntentoEnvio(false) }}
              className={intentoEnvio && sinHorario ? 'input-error' : ''}
            >
              <option value="">— Elige una fecha y hora —</option>
              {(detalle.horarios_proximos || []).map((horario, index) => (
                <option key={horario.hor_guid || index} value={horario.hor_guid}>
                  {horario.fecha} {horario.hora_inicio}
                  {horario.cupos != null ? ` — ${horario.cupos} cupos disponibles` : ''}
                </option>
              ))}
            </select>
            {intentoEnvio && sinHorario && (
              <span className="field-error">⚠ Selecciona un horario para continuar</span>
            )}
          </div>

          {/* Tickets */}
          <div className="form-group">
            <label>Cantidad de tickets *</label>
            <div className="tickets-box">
              {(detalle.tickets || []).map((ticket) => (
                <div className="ticket-row" key={ticket.tck_guid}>
                  <div className="ticket-row-info">
                    <strong>{ticket.tipo}</strong>
                    <span>${Number(ticket.precio).toFixed(2)} por persona</span>
                  </div>
                  <div className="ticket-qty">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setCantidades((prev) => ({
                        ...prev,
                        [ticket.tck_guid]: Math.max(0, (Number(prev[ticket.tck_guid] || 0) - 1))
                      }))}
                    >−</button>
                    <input
                      type="number"
                      min="0"
                      value={cantidades[ticket.tck_guid] || 0}
                      onChange={(e) =>
                        setCantidades((prev) => ({ ...prev, [ticket.tck_guid]: e.target.value }))
                      }
                    />
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setCantidades((prev) => ({
                        ...prev,
                        [ticket.tck_guid]: (Number(prev[ticket.tck_guid] || 0) + 1)
                      }))}
                    >+</button>
                  </div>
                </div>
              ))}
            </div>
            {intentoEnvio && sinTickets && (
              <span className="field-error">⚠ Selecciona al menos un ticket</span>
            )}
          </div>

          {/* Resumen */}
          <div className="totales-box">
            <p><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></p>
            <p><span>IVA 15%</span><span>${iva.toFixed(2)}</span></p>
            <p className="total"><span>Total</span><span>${total.toFixed(2)}</span></p>
          </div>

          <button
            type="submit"
            className="btn btn-full"
            disabled={creando}
          >
            {creando ? (
              <><span className="spinner spinner-sm" /> Procesando reserva...</>
            ) : 'Confirmar reserva'}
          </button>
        </form>
      )}
    </section>
  )
}

export default ReservaPage
