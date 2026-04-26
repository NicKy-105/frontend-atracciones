import { useEffect, useState } from 'react'
import { adminApi } from '../../api/adminApi'

export function useGestionHorarios() {
  const [items, setItems] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const cargar = async () => {
    setCargando(true)
    setError('')
    try {
      const data = await adminApi.listarHorariosAdmin()
      setItems(data)
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo cargar horarios')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const guardar = async (payload, guid) => {
    if (guid) await adminApi.updateHorario(guid, payload)
    else await adminApi.createHorario(payload)
    await cargar()
  }

  const desactivar = async (guid) => {
    await adminApi.updateHorario(guid, { estado: 'INACTIVO' })
    await cargar()
  }

  return { items, cargando, error, guardar, desactivar, recargar: cargar }
}
