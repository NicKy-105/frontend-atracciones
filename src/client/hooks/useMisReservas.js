import { useCallback, useState } from 'react'
import { listarMisReservas, obtenerReserva } from '../../api/reservasApi'

export function useMisReservas() {
  const [reservas, setReservas] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const cargarReservas = useCallback(async () => {
    setCargando(true)
    setError('')
    try {
      const data = await listarMisReservas()
      setReservas(data?.data || [])
      return data
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudieron cargar las reservas')
      throw err
    } finally {
      setCargando(false)
    }
  }, [])

  const buscarReservaPorGuid = useCallback(async (guid) => {
    setCargando(true)
    setError('')
    try {
      const data = await obtenerReserva(guid)
      setReservas(data?.data ? [data.data] : [data])
    } catch (err) {
      setError(err?.response?.data?.message || 'No se encontró la reserva solicitada')
    } finally {
      setCargando(false)
    }
  }, [])

  return { reservas, cargando, error, cargarReservas, buscarReservaPorGuid }
}
