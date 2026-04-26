function TablaHorarios({ items, onEditar, onDesactivar }) {
  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th>Ticket</th>
          <th>Fecha Hora</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.guid}>
            <td>{item.tck_guid}</td>
            <td>{item.fecha_hora || item.hora}</td>
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

export default TablaHorarios
