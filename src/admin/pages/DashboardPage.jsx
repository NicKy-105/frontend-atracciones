import { Link } from 'react-router-dom'

function DashboardPage() {
  return (
    <section className="page-section">
      <h1 className="admin-dashboard-title">Panel de administración de Aventuras Reservadas</h1>
      <p className="admin-dashboard-subtitle">
        Gestiona atracciones, tickets, horarios, reservas y usuarios desde un solo lugar.
      </p>
      <div className="admin-links">
        <Link className="btn btn-outline" to="/admin/atracciones">
          Gestion Atracciones
        </Link>
        <Link className="btn btn-outline" to="/admin/tickets">
          Gestion Tickets
        </Link>
        <Link className="btn btn-outline" to="/admin/horarios">
          Gestion Horarios
        </Link>
        <Link className="btn btn-outline" to="/admin/reservas">
          Gestion Reservas
        </Link>
        <Link className="btn btn-outline" to="/admin/usuarios">
          Gestion Usuarios
        </Link>
      </div>
    </section>
  )
}

export default DashboardPage
