import { useNavigate } from 'react-router-dom'

const FALLBACK_IMAGE = 'https://placehold.co/400x300?text=Sin+imagen'

function TarjetaAtraccion({ atraccion }) {
  const navigate = useNavigate()
  const imagen = atraccion?.imagen_principal || FALLBACK_IMAGE

  return (
    <article className="atraccion-card">
      <img src={imagen} alt={atraccion?.nombre || 'Atraccion'} />
      <div className="atraccion-info">
        <h3>{atraccion?.nombre}</h3>
        <p>{atraccion?.ciudad}</p>
        <p>Desde ${atraccion?.precio_desde ?? atraccion?.precio ?? 0}</p>
        <p>
          {atraccion?.calificacion ?? 0} ({atraccion?.total_resenas ?? 0} resenas)
        </p>
        <p>Idiomas: {(atraccion?.idiomas_disponibles || []).join(', ') || 'N/D'}</p>
        <button
          type="button"
          className="btn"
          onClick={() => navigate(`/atracciones/${atraccion?.id}`)}
        >
          Ver detalle
        </button>
      </div>
    </article>
  )
}

export default TarjetaAtraccion
