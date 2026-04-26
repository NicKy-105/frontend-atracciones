import { useState } from 'react'
import ErrorMessage from '../../components/common/ErrorMessage'
import Spinner from '../../components/common/Spinner'
import FormularioHorario from '../components/FormularioHorario'
import TablaHorarios from '../components/TablaHorarios'
import { useGestionHorarios } from '../hooks/useGestionHorarios'

function GestionHorariosPage() {
  const { items, cargando, error, guardar, desactivar } = useGestionHorarios()
  const [editando, setEditando] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  const onGuardar = async (payload) => {
    await guardar(payload, editando?.guid)
    setMostrarFormulario(false)
  }

  return (
    <section className="page-section">
      <h1>Gestion de Horarios</h1>
      <button className="btn" onClick={() => setMostrarFormulario(true)}>
        Crear nuevo
      </button>
      {mostrarFormulario && (
        <FormularioHorario
          inicial={editando}
          onGuardar={onGuardar}
          onCancelar={() => setMostrarFormulario(false)}
        />
      )}
      {cargando && <Spinner message="Cargando horarios..." />}
      <ErrorMessage mensaje={error} />
      <TablaHorarios
        items={items}
        onEditar={(item) => {
          setEditando(item)
          setMostrarFormulario(true)
        }}
        onDesactivar={desactivar}
      />
    </section>
  )
}

export default GestionHorariosPage
