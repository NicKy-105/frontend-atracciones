import { useState } from 'react'
import * as reservasApi from '../../api/reservasApi'

export function useReserva() {
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [reservaCreada, setReservaCreada] = useState(null)

  const crearReserva = async (atGuid, horGuid, lineas, origenCanal = 'web', clienteInvitado = null) => {
    setCargando(true)
    setError('')
    const body = {
      at_guid: atGuid,
      hor_guid: horGuid,
      lineas: lineas.map((item) => ({
        tck_guid: item.tck_guid,
        cantidad: Number(item.cantidad),
      })),
      origen_canal: origenCanal,
    }
    if (clienteInvitado) {
      body.cliente_invitado = clienteInvitado
    }

    try {
      const data = await reservasApi.crearReserva(body)
      const reserva = data?.data || data
      setReservaCreada(reserva)
      return reserva
    } catch (err) {
      if (err?.response?.status === 409) {
        setError('No hay cupos suficientes para el horario seleccionado.')
      } else {
        setError(
          err?.response?.data?.message ||
          err?.response?.data?.errors?.[0] ||
          'No se pudo crear la reserva. Verifica los datos ingresados.',
        )
      }
      throw err
    } finally {
      setCargando(false)
    }
  }

  return { cargando, error, reservaCreada, crearReserva }
}
