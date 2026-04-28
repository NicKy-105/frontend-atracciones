import { useEffect, useState } from 'react'
import * as facturasApi from '../../api/facturasApi'
import ErrorMessage from '../../components/common/ErrorMessage'
import Spinner from '../../components/common/Spinner'

/**
 * Listado de facturas del cliente autenticado.
 *
 * Endpoint: GET /api/v1/facturas/mis-facturas (cliente autenticado).
 * Respuesta: ApiListResponse<FacturaResponse>.
 *
 * Limitación conocida: el backend público no expone hoy un endpoint para que
 * el cliente "Genere" su propia factura desde el portal. Por ello no se
 * muestra acción de generar; las facturas aparecen aquí cuando ya fueron
 * emitidas (proceso administrativo o automático tras la reserva).
 */

function ModalFactura({ factura, onCerrar }) {
  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>Factura #{factura.fct_numero || '—'}</h2>
        <p><strong>Receptor:</strong> {factura.fct_receptor || '—'}</p>
        <p>
          <strong>Fecha de emisión:</strong>{' '}
          {factura.fct_fecha_emision
            ? String(factura.fct_fecha_emision).slice(0, 10)
            : '—'}
        </p>
        <p><strong>Total:</strong> ${Number(factura.fct_total ?? 0).toFixed(2)}</p>
        <p><strong>Estado:</strong> {factura.fct_estado || '—'}</p>
        {factura.fct_observacion && (
          <p><strong>Observación:</strong> {factura.fct_observacion}</p>
        )}
        <button className="btn btn-outline" style={{ marginTop: '1rem' }} onClick={onCerrar}>
          Cerrar
        </button>
      </div>
    </div>
  )
}

function MisFacturasPage() {
  const [facturas, setFacturas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [seleccionada, setSeleccionada] = useState(null)

  const cargar = async (p = 1) => {
    setCargando(true)
    setError('')
    try {
      const respuesta = await facturasApi.listarMisFacturas({ page: p, limit: 10 })
      const lista = respuesta?.data || []
      setFacturas(lista)
      setPage(p)
      const pagination = respuesta?.pagination
      const total = pagination?.total ?? lista.length
      const limit = pagination?.limit ?? 10
      setTotalPages(Math.max(1, Math.ceil(total / limit)))
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudieron cargar las facturas.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar(1) }, [])

  return (
    <section className="page-section">
      <h1>Mis Facturas</h1>
      <ErrorMessage mensaje={error} />
      {cargando && <Spinner message="Cargando facturas..." />}

      {!cargando && (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Fecha emisión</th>
                <th>Subtotal</th>
                <th>IVA</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {facturas.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    No tienes facturas registradas aún.
                  </td>
                </tr>
              )}
              {facturas.map((f) => (
                <tr key={f.fct_guid}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {f.fct_numero || '—'}
                    </span>
                  </td>
                  <td>{f.fct_fecha_emision ? String(f.fct_fecha_emision).slice(0, 10) : '—'}</td>
                  <td>${Number(f.fct_subtotal ?? 0).toFixed(2)}</td>
                  <td>${Number(f.fct_valor_iva ?? 0).toFixed(2)}</td>
                  <td><strong>${Number(f.fct_total ?? 0).toFixed(2)}</strong></td>
                  <td>{f.fct_estado || '—'}</td>
                  <td>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => setSeleccionada(f)}
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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

      {seleccionada && (
        <ModalFactura factura={seleccionada} onCerrar={() => setSeleccionada(null)} />
      )}
    </section>
  )
}

export default MisFacturasPage
