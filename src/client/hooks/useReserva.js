import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as reservasApi from '../../api/reservasApi'

export function useReserva() {
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [reservaCreada, setReservaCreada] = useState(null)
  const navigate = useNavigate()

  const crearReserva = async (horGuid, lineas, origenCanal = 'web') => {
    setCargando(true)
    setError('')
    const body = {
      hor_guid: horGuid,
      lineas: lineas.map((item) => ({
        tck_guid: item.tck_guid,
        cantidad: Number(item.cantidad),
      })),
      origen_canal: origenCanal,
    }

    try {
      const data = await reservasApi.crearReserva(body)
      setReservaCreada(data)
      return data
    } catch (err) {
      if (err?.response?.status === 409) {
        setError('Cupos insuficientes')
      } else if (err?.response?.status === 401) {
        navigate('/login')
      } else {
        setError(err?.response?.data?.message || 'No se pudo crear la reserva')
      }
      throw err
    } finally {
      setCargando(false)
    }
  }

  return { cargando, error, reservaCreada, crearReserva }
}
