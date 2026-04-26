import { useState } from 'react'
import ErrorMessage from '../../components/common/ErrorMessage'
import Spinner from '../../components/common/Spinner'
import FormularioAtraccion from '../components/FormularioAtraccion'
import TablaAtracciones from '../components/TablaAtracciones'
import { useGestionAtracciones } from '../hooks/useGestionAtracciones'

function GestionAtraccionesPage() {
  const { items, cargando, error, guardar, desactivar } = useGestionAtracciones()
  const [editando, setEditando] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  const abrirNuevo = () => {
    setEditando(null)
    setMostrarFormulario(true)
  }

  const abrirEditar = (item) => {
    setEditando(item)
    setMostrarFormulario(true)
  }

  const onGuardar = async (payload) => {
    await guardar(payload, editando?.guid)
    setMostrarFormulario(false)
  }

  return (
    <section className="page-section">
      <h1>Gestion de Atracciones</h1>
      <button className="btn" onClick={abrirNuevo}>
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
      <TablaAtracciones items={items} onEditar={abrirEditar} onDesactivar={desactivar} />
    </section>
  )
}

export default GestionAtraccionesPage
