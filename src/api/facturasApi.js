import { apiClient } from './atraccionesApi'

export const listarMisFacturas = async (params = {}) => {
  const response = await apiClient.get('/facturas/mis-facturas', { params })
  return response.data
}

export const generarFactura = async (reservaGuid) => {
  const response = await apiClient.post(`/facturas/reserva/${reservaGuid}`)
  return response.data
}
