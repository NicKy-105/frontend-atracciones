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
              <tr key={reserva.guid || reserva.codigo}>
                <td>{reserva.codigo || reserva.guid}</td>
                <td>{reserva.atraccion_nombre || reserva.atraccion?.nombre || 'N/D'}</td>
                <td>{reserva.fecha || reserva.created_at || 'N/D'}</td>
                <td>{reserva.estado || 'N/D'}</td>
                <td>${reserva.total ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

export default MisReservasPage
