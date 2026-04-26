import { useEffect, useState } from 'react'
import * as reseniasApi from '../../api/reseniasApi'
import * as reservasApi from '../../api/reservasApi'
import ErrorMessage from '../../components/common/ErrorMessage'
import Spinner from '../../components/common/Spinner'
import { useMisReservas } from '../hooks/useMisReservas'

// ──────────────────────────────────────────────
// Modal de cancelación
// ──────────────────────────────────────────────
function ModalCancelar({ reserva, onCerrar, onExito }) {
  const [motivo, setMotivo] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const handleCancelar = async () => {
    if (!motivo.trim()) {
      setError('Por favor indica el motivo de la cancelación')
      return
    }
    setCargando(true)
    setError('')
    try {
      await reservasApi.cancelarReserva(reserva.rev_guid, motivo)
      onExito()
    } catch (err) {
      if (err?.response?.status === 409) {
        setError('Esta reserva ya está cancelada')
      } else {
        setError(err?.response?.data?.message || 'No se pudo cancelar la reserva')
      }
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>Cancelar reserva</h2>
        <p>
          Código: <strong>{reserva.rev_codigo}</strong>
        </p>
        <label>
          Motivo de cancelación
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={3}
            style={{ width: '100%', marginTop: '0.5rem' }}
            placeholder="Describe el motivo..."
          />
        </label>
        <ErrorMessage mensaje={error} />
        <div className="inline-form" style={{ marginTop: '1rem' }}>
          <button className="btn" onClick={handleCancelar} disabled={cargando}>
            {cargando ? 'Cancelando...' : 'Confirmar cancelación'}
          </button>
          <button className="btn btn-outline" onClick={onCerrar}>
            Volver
          </button>
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// Formulario inline de reseña
// ──────────────────────────────────────────────
function FormResenia({ reserva, onCerrar }) {
  const [rating, setRating] = useState(5)
  const [comentario, setComentario] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [enviado, setEnviado] = useState(false)

  const handleEnviar = async () => {
    setCargando(true)
    setError('')
    try {
      await reseniasApi.crearResenia({
        rev_guid: reserva.rev_guid,
        rating,
        comentario,
      })
      setEnviado(true)
    } catch (err) {
      if (err?.response?.status === 409) {
        setError('Ya dejaste una reseña para esta reserva')
      } else {
        setError(err?.response?.data?.message || 'No se pudo enviar la reseña')
      }
    } finally {
      setCargando(false)
    }
  }

  if (enviado) {
    return (
      <div className="reserva-card" style={{ marginTop: '0.5rem' }}>
        <p>¡Reseña enviada! Gracias por tu opinión.</p>
        <button className="btn btn-outline" onClick={onCerrar}>
          Cerrar
        </button>
      </div>
    )
  }

  return (
    <div className="reserva-card" style={{ marginTop: '0.5rem' }}>
      <h4>Dejar reseña — {reserva.atraccion_nombre}</h4>
      <label>
        Rating
        <div className="inline-form" style={{ marginTop: '0.25rem' }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.5rem',
                color: n <= rating ? '#f5c518' : 'rgba(255,255,255,0.3)',
                padding: '0',
              }}
            >
              ★
            </button>
          ))}
          <span>{rating}/5</span>
        </div>
      </label>
      <label>
        Comentario
        <textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          rows={3}
          style={{ width: '100%', marginTop: '0.25rem' }}
          placeholder="Comparte tu experiencia..."
        />
      </label>
      <ErrorMessage mensaje={error} />
      <div className="inline-form" style={{ marginTop: '0.75rem' }}>
        <button className="btn" onClick={handleEnviar} disabled={cargando}>
          {cargando ? 'Enviando...' : 'Enviar reseña'}
        </button>
        <button className="btn btn-outline" onClick={onCerrar}>
          Cancelar
        </button>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// Página principal
// ──────────────────────────────────────────────
function MisReservasPage() {
  const [guid, setGuid] = useState('')
  const { reservas, cargando, error, cargarReservas, buscarReservaPorGuid } = useMisReservas()
  const [modalCancelar, setModalCancelar] = useState(null)
  const [reseniaPara, setReseniaPara] = useState(null)

  useEffect(() => {
    cargarReservas().catch(() => {})
  }, [cargarReservas])

  const buscar = async (event) => {
    event.preventDefault()
    if (!guid.trim()) {
      await cargarReservas().catch(() => {})
      return
    }
    await buscarReservaPorGuid(guid.trim())
  }

  return (
    <section className="page-section">
      <h1>Mis reservas</h1>

      <form className="inline-form" onSubmit={buscar}>
        <input
          type="text"
          placeholder="Buscar por código o GUID"
          value={guid}
          onChange={(e) => setGuid(e.target.value)}
        />
        <button className="btn btn-outline" type="submit">
          Buscar
        </button>
        <button
          className="btn btn-outline"
          type="button"
          onClick={() => {
            setGuid('')
            cargarReservas().catch(() => {})
          }}
        >
          Ver todas
        </button>
      </form>

      {cargando && <Spinner message="Consultando reservas..." />}
      <ErrorMessage mensaje={error} />

      {!cargando && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Atracción</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservas.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: '#9ddcff' }}>
                  No se encontraron reservas.
                </td>
              </tr>
            )}
            {reservas.map((reserva) => {
              const activa = reserva.rev_estado === 'A'
              const mostrandoResenia = reseniaPara?.rev_guid === reserva.rev_guid
              return (
                <>
                  <tr key={reserva.rev_codigo || reserva.rev_guid}>
                    <td>{reserva.rev_codigo || '—'}</td>
                    <td>{reserva.atraccion_nombre || '—'}</td>
                    <td>
                      {reserva.rev_fecha_reserva_utc
                        ? reserva.rev_fecha_reserva_utc.slice(0, 10)
                        : '—'}
                    </td>
                    <td>{reserva.rev_estado || '—'}</td>
                    <td>${Number(reserva.rev_total ?? 0).toFixed(2)}</td>
                    <td>
                      {activa && (
                        <>
                          <button
                            className="btn btn-outline"
                            onClick={() => setModalCancelar(reserva)}
                            style={{ marginRight: '0.5rem' }}
                          >
                            Cancelar
                          </button>
                          <button
                            className="btn btn-outline"
                            onClick={() =>
                              setReseniaPara(mostrandoResenia ? null : reserva)
                            }
                          >
                            {mostrandoResenia ? 'Ocultar' : 'Reseña'}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                  {mostrandoResenia && (
                    <tr>
                      <td colSpan={6}>
                        <FormResenia
                          reserva={reserva}
                          onCerrar={() => setReseniaPara(null)}
                        />
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>
      )}

      {modalCancelar && (
        <ModalCancelar
          reserva={modalCancelar}
          onCerrar={() => setModalCancelar(null)}
          onExito={() => {
            setModalCancelar(null)
            cargarReservas().catch(() => {})
          }}
        />
      )}
    </section>
  )
}

export default MisReservasPage
