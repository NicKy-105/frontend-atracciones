import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ErrorMessage from '../../components/common/ErrorMessage'
import Spinner from '../../components/common/Spinner'
import { useAuthContext } from '../../context/AuthContext'
import { useAtracciones } from '../hooks/useAtracciones'

const FALLBACK_IMAGE = 'https://placehold.co/400x300?text=Sin+imagen'

function DetallePage() {
  const { guid } = useParams()
  const navigate = useNavigate()
  const { estaAutenticado } = useAuthContext()
  const { detalle, cargarDetalle, cargando, error } = useAtracciones({})

  useEffect(() => {
    cargarDetalle(guid).catch(() => {})
  }, [guid, cargarDetalle])

  if (cargando && !detalle && !error) return <Spinner message="Cargando detalle..." />

  return (
    <section className="page-section">
      <ErrorMessage mensaje={error} />
      {detalle && (
        <>
          <h1>{detalle.nombre}</h1>
          <div className="detalle-grid">
            <div className="gallery">
              {(detalle.imagenes || [FALLBACK_IMAGE]).map((img, idx) => (
                <img key={idx} src={img || FALLBACK_IMAGE} alt={`${detalle.nombre} ${idx + 1}`} />
              ))}
            </div>
            <div className="detalle-content">
              <p>
                {detalle.ciudad}, {detalle.pais}
              </p>
              <p>{detalle.descripcion}</p>
              <p>Incluye: {(detalle.incluye || []).join(', ') || 'N/D'}</p>
              <p>No incluye: {(detalle.no_incluye || []).join(', ') || 'N/D'}</p>
              <p>Idiomas: {(detalle.idiomas_disponibles || []).join(', ') || 'N/D'}</p>

              <h3>Tickets</h3>
              <ul>
                {(detalle.tickets || []).map((ticket) => (
                  <li key={ticket.tck_guid}>
                    {ticket.tipo} — {ticket.moneda} {ticket.precio}
                  </li>
                ))}
              </ul>

              <h3>Horarios próximos</h3>
              <ul>
                {(detalle.horarios_proximos || []).map((horario, index) => (
                  <li key={`${horario.fecha}-${horario.hora_inicio}-${index}`}>
                    {horario.fecha} {horario.hora_inicio}
                    {horario.hora_fin ? `–${horario.hora_fin}` : ''}{' '}
                    {horario.cupos != null ? `(${horario.cupos} cupos)` : ''}
                  </li>
                ))}
              </ul>

              <h3>Reseñas</h3>
              <ul>
                {(detalle.resenias || detalle.resenas || []).map((resena) => (
                  <li key={resena.rsn_guid || resena.fecha_creacion}>
                    {resena.rating}/5 — {resena.comentario}
                    {resena.fecha_creacion ? ` (${resena.fecha_creacion.slice(0, 10)})` : ''}
                  </li>
                ))}
              </ul>

              {estaAutenticado && (
                <button
                  type="button"
                  className="btn"
                  onClick={() => navigate(`/reservar/${guid}`)}
                >
                  Reservar
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  )
}

export default DetallePage
