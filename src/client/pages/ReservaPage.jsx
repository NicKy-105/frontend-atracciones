import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import ErrorMessage from '../../components/common/ErrorMessage'
import Spinner from '../../components/common/Spinner'
import { useAuthContext } from '../../context/AuthContext'
import { useAtracciones } from '../hooks/useAtracciones'
import { useReserva } from '../hooks/useReserva'

const TIPOS_IDENTIFICACION = ['Cédula', 'Pasaporte', 'RUC', 'Otro']

// ─── Confirmación ────────────────────────────────────────────────────────────
function ConfirmacionReserva({ reserva }) {
  const rows = [
    ['Código', reserva.rev_codigo],
    ['Atracción', reserva.atraccion_nombre],
    reserva.hor_fecha && ['Fecha', reserva.hor_fecha],
    reserva.hor_hora_inicio && ['Horario', reserva.hor_hora_inicio],
    ['Subtotal', `$${Number(reserva.rev_subtotal ?? 0).toFixed(2)}`],
    ['IVA (15%)', `$${Number(reserva.rev_valor_iva ?? 0).toFixed(2)}`],
    ['Total', `$${Number(reserva.rev_total ?? 0).toFixed(2)}`],
  ].filter(Boolean)

  return (
    <section className="page-section">
      <div className="confirmacion-card fade-in">
        <div className="check-icon">✅</div>
        <h1>¡Reserva confirmada!</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Reserva creada correctamente.
        </p>

        {rows.map(([etiqueta, valor]) => (
          <div className="confirmacion-row" key={etiqueta}>
            <span>{etiqueta}</span>
            <span>{valor}</span>
          </div>
        ))}

        {(reserva.detalle || []).length > 0 && (
          <>
            <p style={{ marginTop: '1rem', fontWeight: 600, fontSize: '0.9rem' }}>Detalle de tickets</p>
            {reserva.detalle.map((linea, idx) => (
              <div className="confirmacion-row" key={linea.tck_guid || idx}>
                <span>{linea.tck_tipo_participante || linea.tipo || 'Ticket'}</span>
                <span>{linea.cantidad} × ${Number(linea.precio_unit ?? linea.precio_unitario ?? 0).toFixed(2)}</span>
              </div>
            ))}
          </>
        )}

        <div className="inline-form" style={{ marginTop: '1.75rem' }}>
          <Link to="/mis-reservas" className="btn">Ver mis reservas</Link>
          <Link to="/atracciones" className="btn btn-outline">Volver al catálogo</Link>
        </div>
      </div>
    </section>
  )
}

// ─── Pantalla de elección auth / invitado ─────────────────────────────────────
function PantallaEleccion({ onIniciarSesion, onContinuarComoInvitado }) {
  return (
    <div className="auth-card fade-in" style={{ textAlign: 'center' }}>
      <h2>¿Cómo deseas continuar?</h2>
      <p className="text-muted" style={{ margin: '0.75rem 0 1.5rem' }}>
        Puedes iniciar sesión con tu cuenta o reservar como invitado sin registrarte.
      </p>
      <div className="inline-form" style={{ justifyContent: 'center', flexDirection: 'column', gap: '0.75rem' }}>
        <button className="btn btn-full" type="button" onClick={onIniciarSesion}>
          Iniciar sesión
        </button>
        <button className="btn btn-outline btn-full" type="button" onClick={onContinuarComoInvitado}>
          Continuar sin cuenta / Reservar como invitado
        </button>
      </div>
    </div>
  )
}

// ─── Formulario de datos de invitado ─────────────────────────────────────────
function FormularioInvitado({ onConfirmar, onCancelar }) {
  const [form, setForm] = useState({
    tipo_identificacion: '',
    numero_identificacion: '',
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
  })
  const [errores, setErrores] = useState({})

  const set = (campo) => (e) => {
    setForm((p) => ({ ...p, [campo]: e.target.value }))
    if (errores[campo]) setErrores((p) => ({ ...p, [campo]: '' }))
  }

  const validar = () => {
    const e = {}
    if (!form.tipo_identificacion) e.tipo_identificacion = 'Selecciona el tipo de identificación'
    if (!form.numero_identificacion.trim()) e.numero_identificacion = 'El número de identificación es obligatorio'
    if (!form.correo.trim()) e.correo = 'El correo electrónico es obligatorio'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) e.correo = 'Debes ingresar un correo electrónico válido'
    return e
  }

  const handleConfirmar = () => {
    const e = validar()
    if (Object.keys(e).length) { setErrores(e); return }
    onConfirmar({
      tipo_identificacion: form.tipo_identificacion,
      numero_identificacion: form.numero_identificacion.trim(),
      nombres: form.nombres.trim() || null,
      apellidos: form.apellidos.trim() || null,
      correo: form.correo.trim(),
      telefono: form.telefono.trim() || null,
    })
  }

  return (
    <div className="auth-card fade-in">
      <h2>Datos del cliente</h2>
      <p className="text-muted" style={{ marginBottom: '1.25rem' }}>
        Completa tus datos para continuar con la reserva.
      </p>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="inv-tipo">Tipo de identificación *</label>
          <select
            id="inv-tipo"
            value={form.tipo_identificacion}
            onChange={set('tipo_identificacion')}
            className={errores.tipo_identificacion ? 'input-error' : ''}
          >
            <option value="">Selecciona...</option>
            {TIPOS_IDENTIFICACION.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          {errores.tipo_identificacion && <span className="field-error">⚠ {errores.tipo_identificacion}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="inv-num">Número de identificación *</label>
          <input
            id="inv-num"
            type="text"
            value={form.numero_identificacion}
            onChange={set('numero_identificacion')}
            placeholder="ej. 1234567890"
            className={errores.numero_identificacion ? 'input-error' : ''}
          />
          {errores.numero_identificacion && <span className="field-error">⚠ {errores.numero_identificacion}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="inv-nombres">Nombres</label>
          <input
            id="inv-nombres"
            type="text"
            value={form.nombres}
            onChange={set('nombres')}
            placeholder="Tu nombre"
          />
        </div>

        <div className="form-group">
          <label htmlFor="inv-apellidos">Apellidos</label>
          <input
            id="inv-apellidos"
            type="text"
            value={form.apellidos}
            onChange={set('apellidos')}
            placeholder="Tus apellidos"
          />
        </div>

        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="inv-correo">Correo electrónico *</label>
          <input
            id="inv-correo"
            type="email"
            value={form.correo}
            onChange={set('correo')}
            placeholder="correo@ejemplo.com"
            className={errores.correo ? 'input-error' : ''}
          />
          {errores.correo && <span className="field-error">⚠ {errores.correo}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="inv-tel">Teléfono</label>
          <input
            id="inv-tel"
            type="tel"
            value={form.telefono}
            onChange={set('telefono')}
            placeholder="ej. 0991234567"
          />
        </div>
      </div>

      <div className="inline-form" style={{ marginTop: '1.25rem' }}>
        <button className="btn" type="button" onClick={handleConfirmar}>
          Continuar con la reserva
        </button>
        <button className="btn btn-outline" type="button" onClick={onCancelar}>
          Atrás
        </button>
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────
function ReservaPage() {
  const { guid } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { estaAutenticado } = useAuthContext()

  const [paso, setPaso] = useState('cargando') // cargando | eleccion | invitado | formulario
  const [clienteInvitado, setClienteInvitado] = useState(null)
  const [horGuid, setHorGuid] = useState('')
  const [cantidades, setCantidades] = useState({})
  const [intentoEnvio, setIntentoEnvio] = useState(false)

  const { detalle, cargarDetalle, cargando, error } = useAtracciones({})
  const { crearReserva, reservaCreada, error: errorReserva, cargando: creando } = useReserva()

  useEffect(() => {
    cargarDetalle(guid)
      .then(() => setPaso(estaAutenticado ? 'formulario' : 'eleccion'))
      .catch(() => setPaso(estaAutenticado ? 'formulario' : 'eleccion'))
  }, [guid]) // eslint-disable-line react-hooks/exhaustive-deps

  const lineas = useMemo(
    () =>
      Object.entries(cantidades)
        .filter(([, cantidad]) => Number(cantidad) > 0)
        .map(([tck_guid, cantidad]) => ({ tck_guid, cantidad: Number(cantidad) })),
    [cantidades],
  )

  const subtotal = useMemo(() => {
    if (!detalle?.tickets) return 0
    return detalle.tickets.reduce((acc, ticket) => {
      const cantidad = Number(cantidades[ticket.tck_guid] || 0)
      return acc + cantidad * Number(ticket.precio || 0)
    }, 0)
  }, [cantidades, detalle?.tickets])

  const iva = subtotal * 0.15
  const total = subtotal + iva
  const sinTickets = lineas.length === 0
  const sinHorario = !horGuid

  const handleIniciarSesion = () => {
    navigate('/login', { state: { from: location } })
  }

  const handleContinuarComoInvitado = () => {
    setPaso('invitado')
  }

  const handleDatosInvitado = (datos) => {
    setClienteInvitado(datos)
    setPaso('formulario')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIntentoEnvio(true)
    if (sinHorario || sinTickets) return
    await crearReserva(guid, horGuid, lineas, 'web', clienteInvitado).catch(() => {})
  }

  if (cargando && paso === 'cargando') return <Spinner message="Cargando atracción..." />
  if (reservaCreada) return <ConfirmacionReserva reserva={reservaCreada} />

  const sinHorarios = !cargando && detalle && (detalle.horarios_proximos || []).length === 0

  return (
    <section className="page-section">
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to={`/atracciones/${guid}`} className="text-muted text-sm">← Volver al detalle</Link>
        <h1 style={{ marginTop: '0.5rem' }}>Reservar: {detalle?.nombre}</h1>
      </div>

      <ErrorMessage mensaje={error} />

      {paso === 'eleccion' && (
        <PantallaEleccion
          onIniciarSesion={handleIniciarSesion}
          onContinuarComoInvitado={handleContinuarComoInvitado}
        />
      )}

      {paso === 'invitado' && (
        <FormularioInvitado
          onConfirmar={handleDatosInvitado}
          onCancelar={() => setPaso('eleccion')}
        />
      )}

      {paso === 'formulario' && (
        <>
          {clienteInvitado && (
            <div className="info-message" style={{ marginBottom: '1rem' }}>
              Reservando como invitado: <strong>{clienteInvitado.correo}</strong>.{' '}
              <button
                type="button"
                className="text-sm"
                style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => setPaso('invitado')}
              >
                Cambiar datos
              </button>
            </div>
          )}

          {sinHorarios && (
            <div className="info-message">
              No hay horarios disponibles en los próximos 7 días. Vuelve pronto.
            </div>
          )}

          {!sinHorarios && detalle && (
            <form className="reserva-form" onSubmit={handleSubmit} noValidate>

              <div className="form-group">
                <label htmlFor="horario">Selecciona un horario *</label>
                <select
                  id="horario"
                  value={horGuid}
                  onChange={(e) => { setHorGuid(e.target.value); setIntentoEnvio(false) }}
                  className={intentoEnvio && sinHorario ? 'input-error' : ''}
                >
                  <option value="">— Elige una fecha y hora —</option>
                  {(detalle.horarios_proximos || []).map((horario, index) => (
                    <option key={horario.hor_guid || index} value={horario.hor_guid}>
                      {horario.fecha} {horario.hora_inicio}
                      {horario.cupos != null ? ` — ${horario.cupos} cupos disponibles` : ''}
                    </option>
                  ))}
                </select>
                {intentoEnvio && sinHorario && (
                  <span className="field-error">⚠ Selecciona un horario para continuar</span>
                )}
              </div>

              <div className="form-group">
                <label>Cantidad de tickets *</label>
                <div className="tickets-box">
                  {(detalle.tickets || []).map((ticket) => (
                    <div className="ticket-row" key={ticket.tck_guid}>
                      <div className="ticket-row-info">
                        <strong>{ticket.tipo}</strong>
                        <span>${Number(ticket.precio).toFixed(2)} por persona</span>
                      </div>
                      <div className="ticket-qty">
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => setCantidades((prev) => ({
                            ...prev,
                            [ticket.tck_guid]: Math.max(0, (Number(prev[ticket.tck_guid] || 0) - 1))
                          }))}
                        >−</button>
                        <input
                          type="number"
                          min="0"
                          value={cantidades[ticket.tck_guid] || 0}
                          onChange={(e) =>
                            setCantidades((prev) => ({ ...prev, [ticket.tck_guid]: e.target.value }))
                          }
                        />
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => setCantidades((prev) => ({
                            ...prev,
                            [ticket.tck_guid]: (Number(prev[ticket.tck_guid] || 0) + 1)
                          }))}
                        >+</button>
                      </div>
                    </div>
                  ))}
                </div>
                {intentoEnvio && sinTickets && (
                  <span className="field-error">⚠ Selecciona al menos un ticket</span>
                )}
              </div>

              <div className="totales-box">
                <p><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></p>
                <p><span>IVA 15%</span><span>${iva.toFixed(2)}</span></p>
                <p className="total"><span>Total</span><span>${total.toFixed(2)}</span></p>
              </div>

              <ErrorMessage mensaje={errorReserva} />

              <button
                type="submit"
                className="btn btn-full"
                disabled={creando}
              >
                {creando ? (
                  <><span className="spinner spinner-sm" /> Procesando reserva...</>
                ) : 'Confirmar reserva'}
              </button>
            </form>
          )}
        </>
      )}
    </section>
  )
}

export default ReservaPage
