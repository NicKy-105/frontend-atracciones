import { useEffect, useState } from 'react'
import { adminApi } from '../../api/adminApi'

// Extrae el GUID de un elemento de catálogo independientemente del nombre exacto del campo
const getGuid = (item) =>
  item.des_guid ?? item.cat_guid ?? item.id_guid ?? item.inc_guid ?? item.guid ?? null

const getNombre = (item) =>
  item.des_nombre ?? item.nombre ?? item.descripcion ?? item.name ?? ''

// Alterna un guid en un array (agrega si no está, quita si está)
const toggleGuid = (array, guid) =>
  array.includes(guid) ? array.filter((g) => g !== guid) : [...array, guid]

// ──────────────────────────────────────────────
// Sección de checkboxes reutilizable
// ──────────────────────────────────────────────
function GrupoCheckboxes({ titulo, items, seleccionados, onChange }) {
  if (!items.length) return null
  return (
    <div className="checkbox-group" style={{ gridColumn: '1 / -1' }}>
      <p style={{ margin: '0 0 0.4rem', fontWeight: 600 }}>{titulo}</p>
      <div className="checkbox-grid">
        {items.map((item) => {
          const guid = getGuid(item)
          const nombre = getNombre(item)
          return (
            <label key={guid} className="checkbox-item">
              <input
                type="checkbox"
                checked={seleccionados.includes(guid)}
                onChange={() => onChange(toggleGuid(seleccionados, guid))}
              />
              {nombre}
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
  // ── estado de catálogos ──
  const [catalogos, setCatalogos] = useState({
    destinos: [],
    categorias: [],
    idiomas: [],
    incluye: [],
  })
  const [cargandoCatalogos, setCargandoCatalogos] = useState(true)
  const [errorCatalogos, setErrorCatalogos] = useState('')

  // ── estado del formulario ──
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

  const set = (campo) => (e) => setForm((p) => ({ ...p, [campo]: e.target.value }))
  const setCheck = (campo) => (e) => setForm((p) => ({ ...p, [campo]: e.target.checked }))

  // ── carga de catálogos en paralelo ──
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

  // ── pre-llenado en modo edición ──
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
      incluyeAcompaniante: Boolean(
        inicial.incluye_acompaniante ?? inicial.incluyeAcompaniante,
      ),
      incluyeTransporte: Boolean(
        inicial.incluye_transporte ?? inicial.incluyeTransporte,
      ),
      categoriaGuids: inicial.categoria_guids ?? inicial.categoriaGuids ?? [],
      idiomaGuids: inicial.idioma_guids ?? inicial.idiomaGuids ?? [],
      incluyeGuids: inicial.incluye_guids ?? inicial.incluyeGuids ?? [],
      imagenUrlReferencia: inicial.imagen_url ?? inicial.imagenUrlReferencia ?? '',
    })
  }, [inicial])

  // ── submit ──
  const submit = async (event) => {
    event.preventDefault()
    if (!form.desGuid) return

    const payload = {
      desGuid: form.desGuid,
      nombre: form.nombre,
      descripcion: form.descripcion || null,
      direccion: form.direccion || null,
      duracionMinutos: form.duracionMinutos ? Number(form.duracionMinutos) : null,
      puntoEncuentro: form.puntoEncuentro || null,
      precioReferencia: form.precioReferencia ? Number(form.precioReferencia) : null,
      incluyeAcompaniante: Boolean(form.incluyeAcompaniante),
      incluyeTransporte: Boolean(form.incluyeTransporte),
      categoriaGuids: form.categoriaGuids,
      idiomaGuids: form.idiomaGuids,
      imagenGuids: [],
      incluyeGuids: form.incluyeGuids,
      imagenUrlReferencia: form.imagenUrlReferencia.trim() || undefined,
    }

    await onGuardar(payload)
  }

  // ── estados de carga y error ──
  if (cargandoCatalogos) {
    return (
      <p style={{ padding: '1rem', color: '#9ddcff' }}>Cargando catálogos...</p>
    )
  }

  if (errorCatalogos) {
    return (
      <div style={{ padding: '1rem' }}>
        <p style={{ color: '#ffc8c8' }}>{errorCatalogos}</p>
        <button className="btn btn-outline" type="button" onClick={cargarCatalogos}>
          Reintentar
        </button>
        <button
          className="btn btn-outline"
          type="button"
          onClick={onCancelar}
          style={{ marginLeft: '0.5rem' }}
        >
          Cancelar
        </button>
      </div>
    )
  }

  return (
    <form className="admin-form two-columns" onSubmit={submit}>

      {/* ── Destino ── */}
      <label>
        Destino
        <select
          value={form.desGuid}
          onChange={set('desGuid')}
          required
        >
          <option value="">Selecciona un destino</option>
          {catalogos.destinos.map((d) => {
            const guid = getGuid(d)
            return (
              <option key={guid} value={guid}>
                {getNombre(d)}
              </option>
            )
          })}
        </select>
      </label>

      {/* ── Nombre ── */}
      <label>
        Nombre
        <input
          type="text"
          value={form.nombre}
          onChange={set('nombre')}
          placeholder="Nombre de la atracción"
          required
        />
      </label>

      {/* ── Descripción ── */}
      <label style={{ gridColumn: '1 / -1' }}>
        Descripción
        <textarea
          value={form.descripcion}
          onChange={set('descripcion')}
          placeholder="Descripción de la atracción"
        />
      </label>

      {/* ── Dirección ── */}
      <label>
        Dirección
        <input
          type="text"
          value={form.direccion}
          onChange={set('direccion')}
          placeholder="Dirección"
        />
      </label>

      {/* ── Duración ── */}
      <label>
        Duración (minutos)
        <input
          type="number"
          min="1"
          value={form.duracionMinutos}
          onChange={set('duracionMinutos')}
          placeholder="ej. 120"
        />
      </label>

      {/* ── Punto de encuentro ── */}
      <label>
        Punto de encuentro
        <input
          type="text"
          value={form.puntoEncuentro}
          onChange={set('puntoEncuentro')}
          placeholder="Punto de encuentro"
        />
      </label>

      {/* ── Precio de referencia ── */}
      <label>
        Precio de referencia ($)
        <input
          type="number"
          min="0"
          step="0.01"
          value={form.precioReferencia}
          onChange={set('precioReferencia')}
          placeholder="0.00"
        />
      </label>

      {/* ── Checkboxes simples ── */}
      <label className="checkbox-item">
        <input
          type="checkbox"
          checked={form.incluyeAcompaniante}
          onChange={setCheck('incluyeAcompaniante')}
        />
        Incluye acompañante
      </label>

      <label className="checkbox-item">
        <input
          type="checkbox"
          checked={form.incluyeTransporte}
          onChange={setCheck('incluyeTransporte')}
        />
        Incluye transporte
      </label>

      {/* ── URL imagen de referencia ── */}
      <label style={{ gridColumn: '1 / -1' }}>
        URL de imagen principal (referencia)
        <input
          type="text"
          value={form.imagenUrlReferencia}
          onChange={set('imagenUrlReferencia')}
          placeholder="https://..."
        />
      </label>

      {/* ── Categorías ── */}
      <GrupoCheckboxes
        titulo="Categorías"
        items={catalogos.categorias}
        seleccionados={form.categoriaGuids}
        onChange={(guids) => setForm((p) => ({ ...p, categoriaGuids: guids }))}
      />

      {/* ── Idiomas ── */}
      <GrupoCheckboxes
        titulo="Idiomas"
        items={catalogos.idiomas}
        seleccionados={form.idiomaGuids}
        onChange={(guids) => setForm((p) => ({ ...p, idiomaGuids: guids }))}
      />

      {/* ── Incluye / Actividades ── */}
      <GrupoCheckboxes
        titulo="Incluye"
        items={catalogos.incluye}
        seleccionados={form.incluyeGuids}
        onChange={(guids) => setForm((p) => ({ ...p, incluyeGuids: guids }))}
      />

      {/* ── Acciones ── */}
      <div className="inline-form" style={{ gridColumn: '1 / -1' }}>
        <button className="btn" type="submit">
          Guardar
        </button>
        <button className="btn btn-outline" type="button" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default FormularioAtraccion
