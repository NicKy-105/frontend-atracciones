import { useEffect, useState } from 'react'
import ErrorMessage from '../../components/common/ErrorMessage'
import Spinner from '../../components/common/Spinner'
import FormularioAtraccion from '../components/FormularioAtraccion'
import TablaAtracciones from '../components/TablaAtracciones'
import { useGestionAtracciones } from '../hooks/useGestionAtracciones'

function GestionAtraccionesPage() {
  const { items, cargando, error, page, totalPages, cargar, guardar, desactivar } =
    useGestionAtracciones()
  const [editando, setEditando] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  useEffect(() => {
    cargar(1)
  }, [])

  const abrirNuevo = () => {
    setEditando(null)
    setMostrarFormulario(true)
  }

  const onGuardar = async (payload) => {
    await guardar(payload, editando?.guid)
    setMostrarFormulario(false)
  }

  return (
    <section className="page-section">
      <h1>Gestión de Atracciones</h1>
      <button className="btn" type="button" onClick={abrirNuevo}>
        Crear nuevo
      </button>

      {mostrarFormulario && (
        <FormularioAtraccion
          inicial={editando}
          onGuardar={onGuardar}
          onCancelar={() => setMostrarFormulario(false)}
        />
      )}

      {cargando && <Spinner message="Cargando atracciones..." />}
      <ErrorMessage mensaje={error} />

      <TablaAtracciones
        items={items}
        onEditar={(item) => {
          setEditando(item)
          setMostrarFormulario(true)
        }}
        onDesactivar={desactivar}
      />

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

export default GestionAtraccionesPage
