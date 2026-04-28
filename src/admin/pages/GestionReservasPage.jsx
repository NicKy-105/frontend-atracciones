import { useEffect, useState } from 'react'
import { adminApi } from '../../api/adminApi'
import ErrorMessage from '../../components/common/ErrorMessage'
import Spinner from '../../components/common/Spinner'
import { emitirToast } from '../../components/common/Toast'
import { estadoBadgeClass, estadoLabel } from '../../utils/estadoReserva'
import { useGestionReservas } from '../hooks/useGestionReservas'

function GestionReservasPage() {
  const { items, cargando, error, page, totalPages, cargar } = useGestionReservas()
  const [cancelando, setCancelando] = useState(null)

  useEffect(() => {
    cargar(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const campo = (item, ...claves) => {
    for (const k of claves) {
      if (item[k] != null && item[k] !== '') return item[k]
    }
    return '—'
  }

  const handleCancelar = async (item) => {
    const codigo = campo(item, 'rev_codigo', 'codigo')
    const guid = item.rev_guid ?? item.guid ?? codigo
    if (!window.confirm(`¿Confirmas que deseas cancelar la reserva ${codigo}? Esta acción no se puede deshacer.`)) return
    setCancelando(guid)
    try {
      await adminApi.cancelarReservaAdmin(guid)
      emitirToast('Reserva cancelada correctamente.', 'success')
      await cargar(page)
    } catch (err) {
      emitirToast(
        err?.response?.data?.message || 'No se pudo cancelar la reserva.',
        'error',
      )
    } finally {
      setCancelando(null)
    }
  }

  return (
    <section className="page-section">
      <div className="admin-page-header">
        <h1>Gestión de Reservas</h1>
      </div>

      {cargando && <Spinner message="Cargando reservas..." />}
      <ErrorMessage mensaje={error} />

      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Atracción</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Horario</th>
              <th>Estado</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && !cargando && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No hay reservas registradas.
                </td>
              </tr>
            )}
            {items.map((item) => {
              const codigo = campo(item, 'rev_codigo', 'codigo')
              const atraccion = campo(item, 'atraccion_nombre', 'at_nombre', 'atraccion', 'nombre_atraccion')
              const cliente = campo(item, 'cliente_login', 'cliente_nombre', 'usuario_login', 'usuario_nombre', 'cli_login', 'login')
              const fecha = campo(item, 'rev_fecha_reserva_utc', 'fecha_reserva', 'created_at')
              const horario = campo(item, 'hor_fecha', 'horario_fecha', 'fecha_horario')
              const horaInicio = campo(item, 'hor_hora_inicio', 'hora_inicio')
              const estado = campo(item, 'rev_estado', 'estado')
              const total = Number(item.rev_total ?? item.total ?? 0).toFixed(2)
              const guid = item.rev_guid ?? item.guid ?? codigo
              const esCancelable = ['P', 'A', 'PENDIENTE', 'ACTIVA', 'CONFIRMADA'].includes(estado?.toUpperCase?.() ?? estado)

              return (
                <tr key={guid}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{codigo}</span>
                  </td>
                  <td>{atraccion}</td>
                  <td>{cliente}</td>
                  <td>{fecha ? String(fecha).slice(0, 10) : '—'}</td>
                  <td>
                    {horario !== '—' ? (
                      <span>{String(horario).slice(0, 10)}{horaInicio !== '—' ? ` ${horaInicio}` : ''}</span>
                    ) : '—'}
                  </td>
                  <td>
                    <span className={estadoBadgeClass(estado)}>
                      {estadoLabel(estado)}
                    </span>
                  </td>
                  <td><strong>${total}</strong></td>
                  <td>
                    {esCancelable && (
                      <button
                        className="btn btn-outline btn-sm"
                        style={{ color: 'var(--danger, #e55)' }}
                        disabled={cancelando === guid}
                        onClick={() => handleCancelar(item)}
                      >
                        {cancelando === guid ? 'Cancelando...' : 'Cancelar'}
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          className="btn btn-outline btn-sm"
          disabled={page <= 1}
          onClick={() => cargar(page - 1)}
        >
          ← Anterior
        </button>
        <span className="pagination-info">Página {page} de {totalPages}</span>
        <button
          className="btn btn-outline btn-sm"
          disabled={page >= totalPages}
          onClick={() => cargar(page + 1)}
        >
          Siguiente →
        </button>
      </div>
    </section>
  )
}

export default GestionReservasPage
