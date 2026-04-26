function TablaTickets({ items, onEditar, onDesactivar }) {
  const handleDesactivar = (item) => {
    if (!window.confirm('¿Estás seguro de que deseas desactivar este ticket?')) return
    onDesactivar(item.tck_guid || item.guid)
  }

  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th>Tipo</th>
          <th>Precio</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {items.length === 0 && (
          <tr>
            <td colSpan={4} style={{ textAlign: 'center', color: '#9ddcff' }}>
              No hay tickets registrados.
            </td>
          </tr>
        )}
        {items.map((item) => (
          <tr key={item.tck_guid || item.guid}>
            <td>{item.tipo || item.nombre}</td>
            <td>${Number(item.precio ?? 0).toFixed(2)}</td>
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

export default TablaTickets
