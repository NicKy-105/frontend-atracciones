import { useEffect, useState } from 'react'
import { adminApi } from '../../api/adminApi'
import Spinner from '../../components/common/Spinner'

// Extrae GUID de un item de catálogo independientemente del nombre exacto del campo
const getGuid = (item) =>
  item.des_guid ?? item.cat_guid ?? item.id_guid ?? item.inc_guid ?? item.idi_guid ?? item.guid ?? null

const getNombre = (item) =>
  item.des_nombre ?? item.nombre ?? item.descripcion ?? item.name ?? ''

const toggleGuid = (array, guid) =>
  array.includes(guid) ? array.filter((g) => g !== guid) : [...array, guid]

// ──────────────────────────────────────────────
// Grupo de checkboxes tipo chip
// ──────────────────────────────────────────────
function GrupoChips({ titulo, subtitulo, items, seleccionados, onChange }) {
  if (!items.length) return null
  return (
    <div style={{ gridColumn: '1 / -1' }}>
      <p style={{ margin: '0 0 0.2rem', fontWeight: 700, fontSize: '0.9rem' }}>{titulo}</p>
      {subtitulo && (
        <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {subtitulo}
        </p>
      )}
      <div className="checkbox-grid">
        {items.map((item) => {
          const guid = getGuid(item)
          const nombre = getNombre(item)
          const activo = seleccionados.includes(guid)
          return (
            <label key={guid} className={`checkbox-chip${activo ? ' selected' : ''}`}>
              <input
                type="checkbox"
                checked={activo}
                onChange={() => onChange(toggleGuid(seleccionados, guid))}
              />
              {activo ? '✓ ' : ''}{nombre}
            </label>
          )
        })}
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// Formulario principal
// ──────────────────────────────────────────────
function FormularioAtraccion({ inicial, onGuardar, onCancelar }) {
  const [catalogos, setCatalogos] = useState({
    destinos: [],
    categorias: [],
    idiomas: [],
    incluye: [],
  })
  const [cargandoCatalogos, setCargandoCatalogos] = useState(true)
  const [errorCatalogos, setErrorCatalogos] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [errores, setErrores] = useState({})

  const [form, setForm] = useState({
    desGuid: '',
    nombre: '',
    descripcion: '',
    direccion: '',
    duracionMinutos: '',
    puntoEncuentro: '',
    precioReferencia: '',
    incluyeAcompaniante: false,
    incluyeTransporte: false,
    categoriaGuids: [],
    idiomaGuids: [],
    incluyeGuids: [],
    imagenUrlReferencia: '',
  })

  const set = (campo) => (e) => {
    setForm((p) => ({ ...p, [campo]: e.target.value }))
    if (errores[campo]) setErrores((p) => ({ ...p, [campo]: '' }))
  }
  const setCheck = (campo) => (e) => setForm((p) => ({ ...p, [campo]: e.target.checked }))

  const cargarCatalogos = () => {
    setCargandoCatalogos(true)
    setErrorCatalogos('')
    Promise.all([
      adminApi.listDestinos(),
      adminApi.listarCategorias(),
      adminApi.listarIdiomas(),
      adminApi.listarIncluye(),
    ])
      .then(([destinos, categorias, idiomas, incluye]) => {
        setCatalogos({ destinos, categorias, idiomas, incluye })
      })
      .catch((err) => {
        setErrorCatalogos(
          err?.response?.data?.message || 'No se pudieron cargar los catálogos. Reintenta.',
        )
      })
      .finally(() => setCargandoCatalogos(false))
  }

  useEffect(() => {
    cargarCatalogos()
  }, [])

  useEffect(() => {
    if (!inicial) return
    setForm({
      desGuid: inicial.des_guid ?? inicial.desGuid ?? '',
      nombre: inicial.nombre ?? '',
      descripcion: inicial.descripcion ?? '',
      direccion: inicial.direccion ?? '',
      duracionMinutos: inicial.duracion_minutos ?? inicial.duracionMinutos ?? '',
      puntoEncuentro: inicial.punto_encuentro ?? inicial.puntoEncuentro ?? '',
      precioReferencia: inicial.precio_referencia ?? inicial.precioReferencia ?? '',
      incluyeAcompaniante: Boolean(inicial.incluye_acompaniante ?? inicial.incluyeAcompaniante),
      incluyeTransporte: Boolean(inicial.incluye_transporte ?? inicial.incluyeTransporte),
      categoriaGuids: inicial.categoria_guids ?? inicial.categoriaGuids ?? [],
      idiomaGuids: inicial.idioma_guids ?? inicial.idiomaGuids ?? [],
      incluyeGuids: inicial.incluye_guids ?? inicial.incluyeGuids ?? [],
      imagenUrlReferencia: inicial.imagen_url ?? inicial.imagenUrlReferencia ?? '',
    })
  }, [inicial])

  const validar = () => {
    const e = {}
    if (!form.desGuid) e.desGuid = 'Selecciona un destino'
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio'
    if (form.duracionMinutos && Number(form.duracionMinutos) <= 0) e.duracionMinutos = 'Debe ser mayor a 0'
    if (form.precioReferencia && Number(form.precioReferencia) < 0) e.precioReferencia = 'Debe ser positivo'
    return e
  }

  const submit = async (event) => {
    event.preventDefault()
    const e = validar()
    if (Object.keys(e).length) { setErrores(e); return }

    setGuardando(true)
    const payload = {
      des_guid: form.desGuid,
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || null,
      direccion: form.direccion.trim() || null,
      duracion_minutos: form.duracionMinutos ? Number(form.duracionMinutos) : null,
      punto_encuentro: form.puntoEncuentro.trim() || null,
      precio_referencia: form.precioReferencia ? Number(form.precioReferencia) : null,
      incluye_acompaniante: Boolean(form.incluyeAcompaniante),
      incluye_transporte: Boolean(form.incluyeTransporte),
      categoria_guids: form.categoriaGuids,
      idioma_guids: form.idiomaGuids,
      imagen_guids: [],
      incluye_guids: form.incluyeGuids,
    }

    try {
      await onGuardar(payload)
    } finally {
      setGuardando(false)
    }
  }

  if (cargandoCatalogos) {
    return <Spinner message="Cargando catálogos..." />
  }

  if (errorCatalogos) {
    return (
      <div>
        <div className="error-message" style={{ marginBottom: '1rem' }}>
          <span>⚠</span><span>{errorCatalogos}</span>
        </div>
        <div className="inline-form">
          <button className="btn btn-outline" type="button" onClick={cargarCatalogos}>Reintentar</button>
          <button className="btn btn-outline" type="button" onClick={onCancelar}>Cancelar</button>
        </div>
      </div>
    )
  }

  return (
    <form className="admin-form two-columns" onSubmit={submit} noValidate>

      {/* Destino */}
      <div className="form-group">
        <label htmlFor="fa-destino">Destino *</label>
        <select
          id="fa-destino"
          value={form.desGuid}
          onChange={set('desGuid')}
          className={errores.desGuid ? 'input-error' : ''}
        >
          <option value="">Selecciona un destino</option>
          {catalogos.destinos.map((d) => {
            const guid = getGuid(d)
            return <option key={guid} value={guid}>{getNombre(d)}</option>
          })}
        </select>
        {errores.desGuid && <span className="field-error">⚠ {errores.desGuid}</span>}
      </div>

      {/* Nombre */}
      <div className="form-group">
        <label htmlFor="fa-nombre">Nombre *</label>
        <input
          id="fa-nombre"
          type="text"
          value={form.nombre}
          onChange={set('nombre')}
          placeholder="Nombre de la atracción"
          className={errores.nombre ? 'input-error' : ''}
        />
        {errores.nombre && <span className="field-error">⚠ {errores.nombre}</span>}
      </div>

      {/* Descripción */}
      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
        <label htmlFor="fa-desc">Descripción</label>
        <textarea
          id="fa-desc"
          value={form.descripcion}
          onChange={set('descripcion')}
          placeholder="Describe la experiencia..."
          rows={3}
        />
      </div>

      {/* Dirección */}
      <div className="form-group">
        <label htmlFor="fa-dir">Dirección</label>
        <input id="fa-dir" type="text" value={form.direccion} onChange={set('direccion')} placeholder="Calle y número" />
      </div>

      {/* Duración */}
      <div className="form-group">
        <label htmlFor="fa-dur">Duración (minutos)</label>
        <input
          id="fa-dur"
          type="number"
          min="1"
          value={form.duracionMinutos}
          onChange={set('duracionMinutos')}
          placeholder="ej. 120"
          className={errores.duracionMinutos ? 'input-error' : ''}
        />
        {errores.duracionMinutos && <span className="field-error">⚠ {errores.duracionMinutos}</span>}
      </div>

      {/* Punto de encuentro */}
      <div className="form-group">
        <label htmlFor="fa-pe">Punto de encuentro</label>
        <input id="fa-pe" type="text" value={form.puntoEncuentro} onChange={set('puntoEncuentro')} placeholder="Dónde se reúnen los participantes" />
      </div>

      {/* Precio de referencia */}
      <div className="form-group">
        <label htmlFor="fa-precio">Precio de referencia ($)</label>
        <input
          id="fa-precio"
          type="number"
          min="0"
          step="0.01"
          value={form.precioReferencia}
          onChange={set('precioReferencia')}
          placeholder="0.00"
          className={errores.precioReferencia ? 'input-error' : ''}
        />
        {errores.precioReferencia && <span className="field-error">⚠ {errores.precioReferencia}</span>}
      </div>

      {/* URL imagen */}
      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
        <label htmlFor="fa-img">URL de imagen principal</label>
        <input
          id="fa-img"
          type="url"
          value={form.imagenUrlReferencia}
          onChange={set('imagenUrlReferencia')}
          placeholder="https://res.cloudinary.com/..."
        />
      </div>

      {/* Servicios adicionales (booleanos) */}
      <div style={{ gridColumn: '1 / -1' }}>
        <p style={{ margin: '0 0 0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
          Servicios adicionales
        </p>
        <p style={{ margin: '0 0 0.6rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Indica si la experiencia incluye estos servicios por defecto.
        </p>
        <div className="servicios-grid">
          <label className={`checkbox-chip${form.incluyeAcompaniante ? ' selected' : ''}`}>
            <input type="checkbox" checked={form.incluyeAcompaniante} onChange={setCheck('incluyeAcompaniante')} />
            {form.incluyeAcompaniante ? '✓ ' : ''}Acompañante incluido
          </label>
          <label className={`checkbox-chip${form.incluyeTransporte ? ' selected' : ''}`}>
            <input type="checkbox" checked={form.incluyeTransporte} onChange={setCheck('incluyeTransporte')} />
            {form.incluyeTransporte ? '✓ ' : ''}Transporte incluido
          </label>
        </div>
      </div>

      {/* Categorías */}
      <GrupoChips
        titulo="Categorías"
        subtitulo="Selecciona las categorías que aplican."
        items={catalogos.categorias}
        seleccionados={form.categoriaGuids}
        onChange={(guids) => setForm((p) => ({ ...p, categoriaGuids: guids }))}
      />

      {/* Idiomas */}
      <GrupoChips
        titulo="Idiomas disponibles"
        subtitulo="Idiomas en que se ofrece la experiencia."
        items={catalogos.idiomas}
        seleccionados={form.idiomaGuids}
        onChange={(guids) => setForm((p) => ({ ...p, idiomaGuids: guids }))}
      />

      {/* Elementos incluidos */}
      <GrupoChips
        titulo="Elementos incluidos en la experiencia"
        subtitulo="Recursos o servicios que forman parte de la actividad (guía, equipo, etc.)."
        items={catalogos.incluye}
        seleccionados={form.incluyeGuids}
        onChange={(guids) => setForm((p) => ({ ...p, incluyeGuids: guids }))}
      />

      {/* Acciones */}
      <div className="inline-form" style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
        <button className="btn" type="submit" disabled={guardando}>
          {guardando ? <><span className="spinner spinner-sm" /> Guardando...</> : 'Guardar'}
        </button>
        <button className="btn btn-outline" type="button" onClick={onCancelar} disabled={guardando}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default FormularioAtraccion
