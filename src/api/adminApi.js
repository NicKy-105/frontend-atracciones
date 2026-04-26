import { apiClient } from './atraccionesApi'

export const adminApi = {
  listarAtraccionesAdmin: async (params = {}) => {
    const response = await apiClient.get('/admin/atracciones', { params })
    return response.data?.data || []
  },
  createAtraccion: async (payload) => {
    const response = await apiClient.post('/admin/atracciones', payload)
    return response.data
  },
  updateAtraccion: async (guid, payload) => {
    const response = await apiClient.put(`/admin/atracciones/${guid}`, payload)
    return response.data
  },
  desactivarAtraccion: async (guid) => {
    const response = await apiClient.delete(`/admin/atracciones/${guid}`)
    return response.data
  },

  // Destinos para formularios admin
  listDestinos: async () => {
    const response = await apiClient.get('/admin/destinos')
    return response.data?.data || []
  },
  createDestino: async (payload) => {
    const response = await apiClient.post('/admin/destinos', payload)
    return response.data
  },
  createImagen: async (payload) => {
    const response = await apiClient.post('/admin/imagenes', payload)
    return response.data
  },

  listarTicketsAdmin: async (params = {}) => {
    const response = await apiClient.get('/admin/tickets', { params })
    return response.data?.data || []
  },
  createTicket: async (payload) => {
    const response = await apiClient.post('/admin/tickets', payload)
    return response.data
  },
  updateTicket: async (guid, payload) => {
    const response = await apiClient.put(`/admin/tickets/${guid}`, payload)
    return response.data
  },

  listarHorariosAdmin: async (params = {}) => {
    const response = await apiClient.get('/admin/horarios', { params })
    return response.data?.data || []
  },
  createHorario: async (payload) => {
    const response = await apiClient.post('/admin/horarios', payload)
    return response.data
  },
  updateHorario: async (guid, payload) => {
    const response = await apiClient.put(`/admin/horarios/${guid}`, payload)
    return response.data
  },

  listarReservasAdmin: async (params = {}) => {
    const response = await apiClient.get('/admin/reservas', { params })
    return response.data?.data || []
  },

  listarUsuariosAdmin: async (params = {}) => {
    const response = await apiClient.get('/admin/usuarios', { params })
    return response.data?.data || []
  },
  createUsuario: async (payload) => {
    const response = await apiClient.post('/admin/usuarios', payload)
    return response.data
  },
}
