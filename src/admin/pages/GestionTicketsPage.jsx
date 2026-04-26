import { useState } from 'react'
import ErrorMessage from '../../components/common/ErrorMessage'
import Spinner from '../../components/common/Spinner'
import FormularioTicket from '../components/FormularioTicket'
import TablaTickets from '../components/TablaTickets'
import { useGestionTickets } from '../hooks/useGestionTickets'

function GestionTicketsPage() {
  const { items, cargando, error, guardar, desactivar } = useGestionTickets()
  const [editando, setEditando] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  const onGuardar = async (payload) => {
    await guardar(payload, editando?.guid)
    setMostrarFormulario(false)
  }

  return (
    <section className="page-section">
      <h1>Gestion de Tickets</h1>
      <button className="btn" onClick={() => setMostrarFormulario(true)}>
        Crear nuevo
      </button>
      {mostrarFormulario && (
        <FormularioTicket
          inicial={editando}
          onGuardar={onGuardar}
          onCancelar={() => setMostrarFormulario(false)}
        />
      )}
      {cargando && <Spinner message="Cargando tickets..." />}
      <ErrorMessage mensaje={error} />
      <TablaTickets
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

export default GestionTicketsPage
