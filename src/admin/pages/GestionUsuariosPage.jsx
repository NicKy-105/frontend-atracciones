import { useEffect, useState } from 'react'
import { adminApi } from '../../api/adminApi'
import ErrorMessage from '../../components/common/ErrorMessage'
import Spinner from '../../components/common/Spinner'

function GestionUsuariosPage() {
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const LIMIT = 10

  const cargar = (p = 1) => {
    setCargando(true)
    setError('')
    adminApi
      .listarUsuariosAdmin({ page: p, limit: LIMIT })
      .then((data) => {
        setUsuarios(Array.isArray(data) ? data : [])
        setPage(p)
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'No se pudo cargar usuarios')
      })
      .finally(() => setCargando(false))
  }

  useEffect(() => {
    cargar(1)
  }, [])

  return (
    <section className="page-section">
      <h1>Gestión de Usuarios</h1>
      {cargando && <Spinner message="Cargando usuarios..." />}
      <ErrorMessage mensaje={error} />

      <table className="admin-table">
        <thead>
          <tr>
            <th>Login</th>
            <th>Roles</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.length === 0 && !cargando && (
            <tr>
              <td colSpan={3} style={{ textAlign: 'center', color: '#9ddcff' }}>
                No hay usuarios registrados.
              </td>
            </tr>
          )}
          {usuarios.map((item) => (
            <tr key={item.guid || item.usr_guid || item.login}>
              <td>{item.login}</td>
              <td>{(item.roles || [item.rol]).filter(Boolean).join(', ') || '—'}</td>
              <td>{item.estado || 'ACTIVO'}</td>
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

export default GestionUsuariosPage
