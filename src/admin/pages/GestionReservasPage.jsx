import { useEffect } from 'react'
import ErrorMessage from '../../components/common/ErrorMessage'
import Spinner from '../../components/common/Spinner'
import { useGestionReservas } from '../hooks/useGestionReservas'

function GestionReservasPage() {
  const { items, cargando, error, page, totalPages, cargar } = useGestionReservas()

  useEffect(() => {
    cargar(1)
  }, [])

  return (
    <section className="page-section">
      <h1>Gestión de Reservas</h1>
      {cargando && <Spinner message="Cargando reservas..." />}
      <ErrorMessage mensaje={error} />

      <table className="admin-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Atracción</th>
            <th>Cliente</th>
            <th>Estado</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && !cargando && (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', color: '#9ddcff' }}>
                No hay reservas registradas.
              </td>
            </tr>
          )}
          {items.map((item) => (
            <tr key={item.rev_codigo || item.rev_guid || item.guid}>
              <td>{item.rev_codigo || item.codigo || '—'}</td>
              <td>{item.atraccion_nombre || '—'}</td>
              <td>{item.cliente_login || item.usuario_nombre || '—'}</td>
              <td>{item.rev_estado || item.estado || '—'}</td>
              <td>${Number(item.rev_total ?? item.total ?? 0).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button
          className="btn btn-outline"
          disabled={page <= 1}
          onClick={() => cargar(page - 1)}
        >
          Anterior
        </button>
        <span>
          Página {page} de {totalPages}
        </span>
        <button
          className="btn btn-outline"
          disabled={page >= totalPages}
          onClick={() => cargar(page + 1)}
        >
          Siguiente
        </button>
      </div>
    </section>
  )
}

export default GestionReservasPage
