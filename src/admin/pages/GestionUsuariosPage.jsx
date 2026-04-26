import { useEffect, useState } from 'react'
import { adminApi } from '../../api/adminApi'
import ErrorMessage from '../../components/common/ErrorMessage'
import Spinner from '../../components/common/Spinner'

function GestionUsuariosPage() {
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const cargar = async () => {
    setCargando(true)
    setError('')
    try {
      const data = await adminApi.listarUsuariosAdmin()
      setUsuarios(data)
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo cargar usuarios')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  return (
    <section className="page-section">
      <h1>Gestion de Usuarios</h1>
      {cargando && <Spinner message="Cargando usuarios..." />}
      <ErrorMessage mensaje={error} />
      <table className="admin-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Usuario</th>
            <th>Rol</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((item) => (
            <tr key={item.guid}>
              <td>{item.nombre}</td>
              <td>{item.login}</td>
              <td>{item.rol}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

export default GestionUsuariosPage
