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
      const resp = await adminApi.listarReservasAdmin({ page: p, limit: LIMIT })
      // El backend puede devolver el array directamente o dentro de data
      const lista = Array.isArray(resp) ? resp : (resp?.data ?? resp ?? [])
      setItems(lista)
      setPage(p)
      // Intentar obtener totalPages de la respuesta si existe
      if (resp?.pagination?.totalPages) {
        setTotalPages(resp.pagination.totalPages)
      } else if (resp?.totalPages) {
        setTotalPages(resp.totalPages)
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo cargar las reservas')
    } finally {
      setCargando(false)
    }
  }

  return { items, cargando, error, page, totalPages, cargar }
}
