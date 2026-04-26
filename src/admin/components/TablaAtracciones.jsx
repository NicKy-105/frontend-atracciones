function TablaAtracciones({ items, onEditar, onDesactivar }) {
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
        {items.map((item) => (
          <tr key={item.guid}>
            <td>{item.nombre}</td>
            <td>{item.ciudad}</td>
            <td>{item.estado || 'ACTIVO'}</td>
            <td>
              <button className="btn btn-outline" onClick={() => onEditar(item)}>
                Editar
              </button>
              <button className="btn btn-outline" onClick={() => onDesactivar(item.guid)}>
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
