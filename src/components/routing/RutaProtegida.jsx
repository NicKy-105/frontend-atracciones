import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'

function RutaProtegida({ children }) {
  const { estaAutenticado } = useAuthContext()

  if (!estaAutenticado) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default RutaProtegida
