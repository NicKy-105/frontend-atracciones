function TablaAtracciones({ items, onEditar, onDesactivar }) {
  const handleDesactivar = (item) => {
    if (!window.confirm('¿Estás seguro de que deseas desactivar esta atracción?')) return
    onDesactivar(item.guid || item.at_guid)
  }

  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Ciudad</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {items.length === 0 && (
          <tr>
            <td colSpan={4} style={{ textAlign: 'center', color: '#9ddcff' }}>
              No hay atracciones registradas.
            </td>
          </tr>
        )}
        {items.map((item) => (
          <tr key={item.guid || item.at_guid || item.id}>
            <td>{item.nombre}</td>
            <td>{item.ciudad}</td>
            <td>{item.estado || 'ACTIVO'}</td>
            <td>
              <button
                className="btn btn-outline"
                style={{ marginRight: '0.5rem' }}
                onClick={() => onEditar(item)}
              >
                Editar
              </button>
              <button className="btn btn-outline" onClick={() => handleDesactivar(item)}>
                Desactivar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default TablaAtracciones
