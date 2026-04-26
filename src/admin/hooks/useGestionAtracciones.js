import { useEffect, useState } from 'react'
import { adminApi } from '../../api/adminApi'

export function useGestionAtracciones() {
  const [items, setItems] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const cargar = async () => {
    setCargando(true)
    setError('')
    try {
      const data = await adminApi.listarAtraccionesAdmin()
      setItems(data)
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo cargar atracciones')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const guardar = async (payload, guid) => {
    if (guid) await adminApi.updateAtraccion(guid, payload)
    else await adminApi.createAtraccion(payload)
    await cargar()
  }

  const desactivar = async (guid) => {
    await adminApi.desactivarAtraccion(guid)
    await cargar()
  }

  return { items, cargando, error, guardar, desactivar, recargar: cargar }
}
