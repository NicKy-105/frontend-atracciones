import { useState } from 'react'
import { adminApi } from '../../api/adminApi'

export function useGestionReservas() {
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
      const raw = await adminApi.listarReservasAdmin({ page: p, limit: LIMIT })
      setItems(Array.isArray(raw) ? raw : [])
      setPage(p)
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo cargar reservas')
    } finally {
      setCargando(false)
    }
  }

  return { items, cargando, error, page, totalPages, cargar }
}
