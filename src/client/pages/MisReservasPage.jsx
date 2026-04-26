import { useEffect } from 'react'
import { useState } from 'react'
import ErrorMessage from '../../components/common/ErrorMessage'
import Spinner from '../../components/common/Spinner'
import { useMisReservas } from '../hooks/useMisReservas'

function MisReservasPage() {
  const [guid, setGuid] = useState('')
  const { reservas, cargando, error, cargarReservas, buscarReservaPorGuid } = useMisReservas()

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
          placeholder="Buscar por GUID"
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
      {cargando && <Spinner message="Consultando reserva..." />}
      <ErrorMessage mensaje={error} />
      {!cargando && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Codigo</th>
              <th>Atraccion</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {reservas.map((reserva) => (
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
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

export default MisReservasPage
