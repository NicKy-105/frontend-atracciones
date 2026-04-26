import { useEffect, useState } from 'react'
import { adminApi } from '../../api/adminApi'

export function useGestionTickets() {
  const [items, setItems] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const cargar = async () => {
    setCargando(true)
    setError('')
    try {
      const data = await adminApi.listarTicketsAdmin()
      setItems(data)
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo cargar tickets')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const guardar = async (payload, guid) => {
    if (guid) await adminApi.updateTicket(guid, payload)
    else await adminApi.createTicket(payload)
    await cargar()
  }

  const desactivar = async (guid) => {
    await adminApi.updateTicket(guid, { estado: 'INACTIVO' })
    await cargar()
  }

  return { items, cargando, error, guardar, desactivar, recargar: cargar }
}
