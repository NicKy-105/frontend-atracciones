import { useEffect, useState } from 'react'
import * as facturasApi from '../../api/facturasApi'
import ErrorMessage from '../../components/common/ErrorMessage'
import Spinner from '../../components/common/Spinner'

function ModalFactura({ factura, onCerrar }) {
  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>Factura #{factura.numero_factura || factura.fct_numero}</h2>
        <p>
          <strong>Receptor:</strong> {factura.receptor || factura.fct_receptor || '—'}
        </p>
        <p>
          <strong>Fecha:</strong>{' '}
          {(factura.fecha_emision || factura.fct_fecha_emision || '').slice(0, 10)}
        </p>
        <p>
          <strong>Total:</strong> ${Number(factura.total || factura.fct_total || 0).toFixed(2)}
        </p>
        <p>
          <strong>Estado:</strong> {factura.estado || factura.fct_estado || '—'}
        </p>
        {(factura.observacion || factura.fct_observacion) && (
          <p>
            <strong>Observación:</strong> {factura.observacion || factura.fct_observacion}
          </p>
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
  const [generando, setGenerando] = useState('')

  const cargar = (p = 1) => {
    setCargando(true)
    setError('')
    facturasApi
      .listarMisFacturas({ page: p, limit: 10 })
      .then((data) => {
        setFacturas(data?.data || [])
        setTotalPages(data?.pagination?.total_pages || 1)
        setPage(p)
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'No se pudieron cargar las facturas')
      })
      .finally(() => setCargando(false))
  }

  useEffect(() => {
    cargar(1)
  }, [])

  const handleGenerar = async (reservaGuid) => {
    setGenerando(reservaGuid)
    try {
      await facturasApi.generarFactura(reservaGuid)
      cargar(page)
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo generar la factura')
    } finally {
      setGenerando('')
    }
  }

  return (
    <section className="page-section">
      <h1>Mis Facturas</h1>
      <ErrorMessage mensaje={error} />
      {cargando && <Spinner message="Cargando facturas..." />}

      {!cargando && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Fecha emisión</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {facturas.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: '#9ddcff' }}>
                  No tienes facturas registradas aún.
                </td>
              </tr>
            )}
            {facturas.map((f) => {
              const numFactura = f.numero_factura || f.fct_numero || '—'
              const fecha = (f.fecha_emision || f.fct_fecha_emision || '').slice(0, 10)
              const total = Number(f.total || f.fct_total || 0).toFixed(2)
              const estado = f.estado || f.fct_estado || '—'
              const reservaGuid = f.rev_guid || f.reserva_guid
              return (
                <tr key={f.guid || f.fct_guid || numFactura}>
                  <td>{numFactura}</td>
                  <td>{fecha}</td>
                  <td>${total}</td>
                  <td>{estado}</td>
                  <td>
                    <button
                      className="btn btn-outline"
                      onClick={() => setSeleccionada(f)}
                    >
                      Ver detalle
                    </button>
                    {reservaGuid && (
                      <button
                        className="btn btn-outline"
                        disabled={generando === reservaGuid}
                        onClick={() => handleGenerar(reservaGuid)}
                        style={{ marginLeft: '0.5rem' }}
                      >
                        {generando === reservaGuid ? 'Generando...' : 'Generar'}
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      <div className="pagination">
        <button
          className="btn btn-outline"
          disabled={page <= 1}
          onClick={() => cargar(page - 1)}
        >
          Anterior
        </button>
        <span>
          Página {page} de {totalPages}
        </span>
        <button
          className="btn btn-outline"
          disabled={page >= totalPages}
          onClick={() => cargar(page + 1)}
        >
          Siguiente
        </button>
      </div>

      {seleccionada && (
        <ModalFactura factura={seleccionada} onCerrar={() => setSeleccionada(null)} />
      )}
    </section>
  )
}

export default MisFacturasPage
