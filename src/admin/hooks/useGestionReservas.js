import { useEffect, useState } from 'react'
import { adminApi } from '../../api/adminApi'

export function useGestionReservas() {
  const [items, setItems] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const cargar = async () => {
    setCargando(true)
    setError('')
    try {
      const data = await adminApi.listarReservasAdmin()
      setItems(data)
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo cargar reservas')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  return { items, cargando, error, recargar: cargar }
}
