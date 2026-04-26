import ErrorMessage from '../../components/common/ErrorMessage'
import Spinner from '../../components/common/Spinner'
import { useGestionReservas } from '../hooks/useGestionReservas'

function GestionReservasPage() {
  const { items, cargando, error } = useGestionReservas()

  return (
    <section className="page-section">
      <h1>Gestion de Reservas</h1>
      {cargando && <Spinner message="Cargando reservas..." />}
      <ErrorMessage mensaje={error} />
      <table className="admin-table">
        <thead>
          <tr>
            <th>Codigo</th>
            <th>Cliente</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.guid}>
              <td>{item.codigo || item.guid}</td>
              <td>{item.usuario_nombre || item.usuario?.nombre || 'N/D'}</td>
              <td>{item.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

export default GestionReservasPage
