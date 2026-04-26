import { apiClient } from './atraccionesApi'

export const crearReserva = async (body) => {
  const response = await apiClient.post('/reservas', body)
  return response.data
}

export const obtenerReserva = async (guid) => {
  const response = await apiClient.get(`/reservas/${guid}`)
  return response.data
}

export const listarMisReservas = async () => {
  const response = await apiClient.get('/reservas')
  return response.data
}

export const cancelarReserva = async (guid, motivo) => {
  const response = await apiClient.patch(`/reservas/${guid}/cancelar`, { motivo })
  return response.data
}
