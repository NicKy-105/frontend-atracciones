import { useState } from 'react'
import { adminApi } from '../../api/adminApi'

export function useGestionHorarios() {
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  // El backend no expone GET /admin/horarios; los horarios se gestionan
  // creando entradas por ticket mediante POST /admin/tickets/horarios
  const guardar = async (payload) => {
    setCargando(true)
    setError('')
    try {
      await adminApi.createHorario(payload)
    } catch (err) {
      const mensaje =
        err?.response?.data?.message || 'No se pudo guardar el horario'
      setError(mensaje)
      throw err
    } finally {
      setCargando(false)
    }
  }

  return { cargando, error, guardar }
}
