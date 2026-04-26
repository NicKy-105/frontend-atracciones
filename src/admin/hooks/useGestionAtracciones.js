import { useState } from 'react'
import { adminApi } from '../../api/adminApi'

export function useGestionAtracciones() {
  const [items, setItems] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const LIMIT = 10

  const cargar = async (p = 1) => {
    setCargando(true)
    setError('')
    try {
      const raw = await adminApi.listarAtraccionesAdmin({ page: p, limit: LIMIT })
      // listarAtraccionesAdmin devuelve el array directamente tras extraer .data.data
      // Si el backend devuelve envelope con paginación, adminApi debería exponerla.
      // Como solo retorna el array, guardamos lo que llegue.
      setItems(Array.isArray(raw) ? raw : [])
      setPage(p)
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo cargar atracciones')
    } finally {
      setCargando(false)
    }
  }

  const guardar = async (payload, guid) => {
    if (guid) await adminApi.updateAtraccion(guid, payload)
    else await adminApi.createAtraccion(payload)
    await cargar(page)
  }

  const desactivar = async (guid) => {
    await adminApi.desactivarAtraccion(guid)
    await cargar(page)
  }

  return { items, cargando, error, page, totalPages, cargar, guardar, desactivar }
}
