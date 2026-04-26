function FiltrosBusqueda({ filtrosDisponibles, filtrosActivos, onFiltroChange }) {
  const tipoSeleccionado = (filtrosDisponibles.typeFilters || []).find(
    (item) => item.tagname === filtrosActivos.tipo,
  )
  const subtipos = tipoSeleccionado?.childFilterOptions || []

  const handleInput = (event) => {
    const { name, value } = event.target
    onFiltroChange({
      ...filtrosActivos,
      [name]: value,
      page: 1,
    })
  }

  const handleDisponible = (event) => {
    onFiltroChange({
      ...filtrosActivos,
      disponible: event.target.checked,
      page: 1,
    })
  }

  return (
    <section className="filtros-card">
      <h3>Filtrar atracciones</h3>
      <div className="filtros-grid">
        <label>
          Busqueda
          <input
            name="textoBusqueda"
            placeholder="Buscar atracción..."
            value={filtrosActivos.textoBusqueda || ''}
            onChange={handleInput}
          />
        </label>

        <label>
          Ciudad
          <select name="ciudad" value={filtrosActivos.ciudad || ''} onChange={handleInput}>
            <option value="">Todas</option>
            {(filtrosDisponibles.destinationFilters || []).map((item) => (
              <option key={item.tagname} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Tipo
          <select name="tipo" value={filtrosActivos.tipo || ''} onChange={handleInput}>
            <option value="">Todos</option>
            {(filtrosDisponibles.typeFilters || []).map((item) => (
              <option key={item.tagname} value={item.tagname}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Subtipo
          <select name="subtipo" value={filtrosActivos.subtipo || ''} onChange={handleInput}>
            <option value="">Todos</option>
            {subtipos.map((item) => (
              <option key={item.tagname} value={item.tagname}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Idioma
          <select name="idioma" value={filtrosActivos.idioma || ''} onChange={handleInput}>
            <option value="">Todos</option>
            {(filtrosDisponibles.supportedLanguageFilters || []).map((item) => (
              <option key={item.tagname} value={item.tagname}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Calificacion minima
          <select
            name="calificacion_min"
            value={filtrosActivos.calificacion_min || ''}
            onChange={handleInput}
          >
            <option value="">Cualquiera</option>
            <option value="3.0">3.0+</option>
            <option value="3.5">3.5+</option>
            <option value="4.0">4.0+</option>
            <option value="4.5">4.5+</option>
          </select>
        </label>

        <label>
          Ordenar por
          <select
            name="ordenar_por"
            value={filtrosActivos.ordenar_por || ''}
            onChange={handleInput}
          >
            <option value="trending">Relevancia</option>
            <option value="lowest_price">Menor precio</option>
            <option value="highest_weighted_rating">Mejor calificación</option>
          </select>
        </label>

        <label className="toggle-row">
          <input
            type="checkbox"
            className="toggle-input"
            checked={Boolean(filtrosActivos.disponible)}
            onChange={handleDisponible}
          />
          <span className="toggle-slider" />
          <span>Solo disponibles</span>
        </label>
      </div>
    </section>
  )
}

export default FiltrosBusqueda
