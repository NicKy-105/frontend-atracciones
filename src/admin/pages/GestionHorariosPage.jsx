import { useState } from 'react'
import ErrorMessage from '../../components/common/ErrorMessage'
import Spinner from '../../components/common/Spinner'
import FormularioHorario from '../components/FormularioHorario'
import { useGestionHorarios } from '../hooks/useGestionHorarios'

function GestionHorariosPage() {
  const { cargando, error, guardar } = useGestionHorarios()
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [exito, setExito] = useState('')

  const onGuardar = async (payload) => {
    await guardar(payload)
    setMostrarFormulario(false)
    setExito('Horario creado correctamente')
    setTimeout(() => setExito(''), 4000)
  }

  return (
    <section className="page-section">
      <h1>Gestión de Horarios</h1>
      <p className="text-muted">
        Los horarios se asocian a un ticket específico. Ingresa el GUID del ticket
        al que pertenece este horario.
      </p>

      <button className="btn" type="button" onClick={() => setMostrarFormulario(true)}>
        Crear nuevo horario
      </button>

      {mostrarFormulario && (
        <FormularioHorario
          onGuardar={onGuardar}
          onCancelar={() => setMostrarFormulario(false)}
        />
      )}

      {cargando && <Spinner message="Guardando..." />}
      <ErrorMessage mensaje={error} />
      {exito && <p className="success-message">{exito}</p>}

      <p className="text-muted" style={{ marginTop: '2rem' }}>
        El listado de horarios se consulta desde el detalle de cada atracción o ticket.
      </p>
    </section>
  )
}

export default GestionHorariosPage
