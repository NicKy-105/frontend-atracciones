import { useEffect, useState } from 'react'
import { adminApi } from '../../api/adminApi'
import ErrorMessage from '../../components/common/ErrorMessage'
import Spinner from '../../components/common/Spinner'
import { emitirToast } from '../../components/common/Toast'
import FormularioAtraccion from '../components/FormularioAtraccion'
import TablaAtracciones from '../components/TablaAtracciones'
import { useGestionAtracciones } from '../hooks/useGestionAtracciones'

function GestionAtraccionesPage() {
  const { items, cargando, error, page, totalPages, cargar, guardar, desactivar } =
    useGestionAtracciones()
  const [editando, setEditando] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [cargandoDetalle, setCargandoDetalle] = useState(false)

  useEffect(() => {
    cargar(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const abrirNuevo = () => {
    setEditando(null)
    setMostrarFormulario(true)
  }

  const abrirEditar = async (item) => {
    // El listado solo trae campos resumidos; el detalle administrativo
    // (con guids de catálogos) lo entrega GET /admin/atracciones/{guid}.
    setCargandoDetalle(true)
    try {
      const detalle = await adminApi.obtenerAtraccionAdmin(item.at_guid)
      setEditando(detalle)
      setMostrarFormulario(true)
    } catch (err) {
      emitirToast(
        err?.response?.data?.message || 'No se pudo cargar el detalle de la atracción.',
        'error',
      )
    } finally {
      setCargandoDetalle(false)
    }
  }

  const onGuardar = async (payload) => {
    await guardar(payload, editando?.at_guid)
    setMostrarFormulario(false)
    setEditando(null)
  }

  return (
    <section className="page-section">
      <div className="admin-page-header">
        <h1>Gestión de Atracciones</h1>
        <button className="btn" type="button" onClick={abrirNuevo}>Crear nueva</button>
      </div>

      {mostrarFormulario && (
        <FormularioAtraccion
          inicial={editando}
          onGuardar={onGuardar}
          onCancelar={() => { setMostrarFormulario(false); setEditando(null) }}
        />
      )}

      {(cargando || cargandoDetalle) && <Spinner message="Cargando..." />}
      <ErrorMessage mensaje={error} />

      <TablaAtracciones
        items={items}
        onEditar={abrirEditar}
        onDesactivar={desactivar}
      />

      <div className="pagination">
        <button
          className="btn btn-outline btn-sm"
          disabled={page <= 1}
          onClick={() => cargar(page - 1)}
        >
          ← Anterior
        </button>
        <span className="pagination-info">Página {page} de {totalPages}</span>
        <button
          className="btn btn-outline btn-sm"
          disabled={page >= totalPages}
          onClick={() => cargar(page + 1)}
        >
          Siguiente →
        </button>
      </div>
    </section>
  )
}

export default GestionAtraccionesPage
