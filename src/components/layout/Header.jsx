import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'

function Header() {
  const { estaAutenticado, usuario, logout } = useAuthContext()
  const navigate = useNavigate()
  const esAdministrador = usuario?.roles?.includes('ADMIN')
  const esClienteAutenticado = estaAutenticado && !esAdministrador

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="site-header">
      <Link to="/" className="brand">
        Aventuras Reservadas
      </Link>

      <nav className="top-nav">
        <NavLink to="/">Inicio</NavLink>
        <NavLink to="/atracciones">Catalogo</NavLink>
        {esClienteAutenticado && <NavLink to="/mis-reservas">Mis Reservas</NavLink>}
        {esClienteAutenticado && <NavLink to="/mis-facturas">Mis Facturas</NavLink>}
        {esClienteAutenticado && <NavLink to="/perfil">Mi Perfil</NavLink>}
        {esAdministrador && <NavLink to="/admin">Administración</NavLink>}
      </nav>

      <div className="header-auth">
        {estaAutenticado ? (
          <>
            <span className="username">
              {usuario?.login || 'Usuario'}
            </span>
            <button type="button" className="btn btn-outline" onClick={handleLogout}>
              Cerrar sesion
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-outline">
              Iniciar sesion
            </Link>
            <Link to="/registro" className="btn btn-outline">
              Registrarse
            </Link>
          </>
        )}
      </div>
    </header>
  )
}

export default Header
