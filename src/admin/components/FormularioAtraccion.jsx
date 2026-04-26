import { useEffect, useState } from 'react'
import { adminApi } from '../../api/adminApi'

function FormularioAtraccion({ inicial, onGuardar, onCancelar }) {
  const [form, setForm] = useState({
    destinoNombre: '',
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
    imagenGuids: [],
    incluyeGuids: [],
    imagenUrlReferencia: '',
  })
  const [destinos, setDestinos] = useState([])

  useEffect(() => {
    adminApi.listDestinos().then(setDestinos).catch(() => setDestinos([]))
  }, [])

  useEffect(() => {
    if (!form.destinoNombre.trim()) return
    const timeoutId = setTimeout(() => {
      adminApi.listDestinos().then(setDestinos).catch(() => {})
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [form.destinoNombre])

  useEffect(() => {
    if (inicial) {
      setForm({
        destinoNombre: inicial.ciudad || '',
        nombre: inicial.nombre || '',
        descripcion: inicial.descripcion || '',
        direccion: inicial.direccion || '',
        duracionMinutos: inicial.duracionMinutos || '',
        puntoEncuentro: inicial.puntoEncuentro || '',
        precioReferencia: inicial.precioReferencia || '',
        incluyeAcompaniante: Boolean(inicial.incluyeAcompaniante),
        incluyeTransporte: Boolean(inicial.incluyeTransporte),
        categoriaGuids: inicial.categoriaGuids || [],
        idiomaGuids: inicial.idiomaGuids || [],
        imagenGuids: inicial.imagenGuids || [],
        incluyeGuids: inicial.incluyeGuids || [],
        imagenUrlReferencia: inicial.imagenUrlReferencia || '',
      })
    }
  }, [inicial])

  const resolverDestinoGuid = async (destinoNombre) => {
    const nombreNormalizado = destinoNombre.trim().toLowerCase()
    let lista = destinos
    if (!lista.length) {
      lista = await adminApi.listDestinos()
      setDestinos(lista)
    }
    const existente = lista.find((item) => item.nombre?.trim().toLowerCase() === nombreNormalizado)
    if (existente) {
      return existente.guid || existente.desGuid
    }

    const creado = await adminApi.createDestino({
      nombre: destinoNombre.trim(),
      pais: 'Ecuador',
    })
    const guidCreado = creado?.data?.guid || creado?.data?.desGuid || creado?.guid || creado?.desGuid
    if (guidCreado) {
      const nuevaLista = [...lista, { guid: guidCreado, nombre: destinoNombre.trim() }]
      setDestinos(nuevaLista)
      return guidCreado
    }
    throw new Error('No se pudo resolver el destino')
  }

  const submit = async (event) => {
    event.preventDefault()
    const desGuid = await resolverDestinoGuid(form.destinoNombre)

    const payload = {
      desGuid,
      nombre: form.nombre,
      descripcion: form.descripcion || null,
      direccion: form.direccion || null,
      duracionMinutos: form.duracionMinutos ? Number(form.duracionMinutos) : null,
      puntoEncuentro: form.puntoEncuentro || null,
      precioReferencia: form.precioReferencia ? Number(form.precioReferencia) : null,
      incluyeAcompaniante: Boolean(form.incluyeAcompaniante),
      incluyeTransporte: Boolean(form.incluyeTransporte),
      categoriaGuids: form.categoriaGuids || [],
      idiomaGuids: form.idiomaGuids || [],
      imagenGuids: form.imagenGuids || [],
      incluyeGuids: form.incluyeGuids || [],
      // URL de imagen como referencia textual; el backend la procesa si soporta el campo
      imagenUrl: form.imagenUrlReferencia.trim() || undefined,
    }
    await onGuardar(payload)
  }

  return (
    <form className="admin-form two-columns" onSubmit={submit}>
      <input
        placeholder="Destino (ciudad)"
        value={form.destinoNombre}
        onChange={(e) => setForm((p) => ({ ...p, destinoNombre: e.target.value }))}
        required
      />
      <input
        placeholder="Nombre"
        value={form.nombre}
        onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
        required
      />
      <textarea
        placeholder="Descripcion"
        value={form.descripcion}
        onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
      />
      <input
        placeholder="Direccion"
        value={form.direccion}
        onChange={(e) => setForm((p) => ({ ...p, direccion: e.target.value }))}
      />
      <input
        placeholder="Duracion en minutos"
        type="number"
        min="0"
        value={form.duracionMinutos}
        onChange={(e) => setForm((p) => ({ ...p, duracionMinutos: e.target.value }))}
      />
      <input
        placeholder="Punto de encuentro"
        value={form.puntoEncuentro}
        onChange={(e) => setForm((p) => ({ ...p, puntoEncuentro: e.target.value }))}
      />
      <input
        placeholder="Precio de referencia"
        type="number"
        min="0"
        step="0.01"
        value={form.precioReferencia}
        onChange={(e) => setForm((p) => ({ ...p, precioReferencia: e.target.value }))}
      />
      <label className="inline-form">
        <input
          type="checkbox"
          checked={form.incluyeAcompaniante}
          onChange={(e) =>
            setForm((p) => ({ ...p, incluyeAcompaniante: e.target.checked }))
          }
        />
        Incluye acompaniante
      </label>
      <label className="inline-form">
        <input
          type="checkbox"
          checked={form.incluyeTransporte}
          onChange={(e) =>
            setForm((p) => ({ ...p, incluyeTransporte: e.target.checked }))
          }
        />
        Incluye transporte
      </label>
      <input
        placeholder="URL de imagen (https://...)"
        value={form.imagenUrlReferencia}
        onChange={(e) => setForm((p) => ({ ...p, imagenUrlReferencia: e.target.value }))}
      />
      <div className="inline-form">
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
