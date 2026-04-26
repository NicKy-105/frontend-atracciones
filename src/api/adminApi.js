import { apiClient } from './atraccionesApi'

export const adminApi = {
  // ─── Atracciones ──────────────────────────────────────────────────────────
  listarAtraccionesAdmin: async (params = {}) => {
    const response = await apiClient.get('/admin/atracciones', { params })
    return response.data?.data || []
  },
  obtenerAtraccionAdmin: async (guid) => {
    const response = await apiClient.get(`/admin/atracciones/${guid}`)
    return response.data?.data || response.data
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

  // ─── Destinos ─────────────────────────────────────────────────────────────
  listDestinos: async () => {
    const response = await apiClient.get('/admin/destinos')
    return response.data?.data || []
  },
  createDestino: async (payload) => {
    const response = await apiClient.post('/admin/destinos', payload)
    return response.data
  },
  updateDestino: async (guid, payload) => {
    const response = await apiClient.put(`/admin/destinos/${guid}`, payload)
    return response.data
  },

  // ─── Tickets ──────────────────────────────────────────────────────────────
  // No existe GET /admin/tickets en el backend; la lista se obtiene
  // desde el detalle de cada atracción (GET /admin/atracciones/{guid})
  listarTicketsAdmin: async () => [],
  createTicket: async (payload) => {
    const response = await apiClient.post('/admin/tickets', payload)
    return response.data
  },
  updateTicket: async (guid, payload) => {
    const response = await apiClient.put(`/admin/tickets/${guid}`, payload)
    return response.data
  },

  // ─── Horarios ─────────────────────────────────────────────────────────────
  // No existe GET /admin/horarios en el backend; los horarios se crean
  // por ticket mediante POST /admin/tickets/horarios
  listarHorariosAdmin: async () => [],
  createHorario: async (payload) => {
    // body: { tck_guid, fecha, hora_inicio, hora_fin?, cupos_disponibles }
    const response = await apiClient.post('/admin/tickets/horarios', payload)
    return response.data
  },

  // ─── Reservas ─────────────────────────────────────────────────────────────
  listarReservasAdmin: async (params = {}) => {
    const response = await apiClient.get('/admin/reservas', { params })
    return response.data?.data || []
  },
  obtenerReservaAdmin: async (guid) => {
    const response = await apiClient.get(`/admin/reservas/${guid}`)
    return response.data?.data || response.data
  },
  actualizarEstadoReserva: async (guid, estado) => {
    const response = await apiClient.put(`/admin/reservas/${guid}/estado`, { estado })
    return response.data
  },

  // ─── Clientes ─────────────────────────────────────────────────────────────
  listarClientesAdmin: async (params = {}) => {
    const response = await apiClient.get('/admin/clientes', { params })
    return response.data?.data || []
  },
  createCliente: async (payload) => {
    const response = await apiClient.post('/admin/clientes', payload)
    return response.data
  },

  // ─── Usuarios (gestión de cuentas) ────────────────────────────────────────
  listarUsuariosAdmin: async (params = {}) => {
    const response = await apiClient.get('/admin/usuarios', { params })
    return response.data?.data || []
  },
  createUsuario: async (payload) => {
    const response = await apiClient.post('/admin/usuarios', payload)
    return response.data
  },

  // ─── Reseñas ──────────────────────────────────────────────────────────────
  listarReseniasAdmin: async (atraccionGuid) => {
    const response = await apiClient.get('/admin/resenias', {
      params: { atraccionGuid },
    })
    return response.data?.data || []
  },
}
