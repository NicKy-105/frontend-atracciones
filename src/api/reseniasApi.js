import { apiClient } from './atraccionesApi'

export const crearResenia = async (body) => {
  // body: { rev_guid, rating, comentario }
  const response = await apiClient.post('/resenias', body)
  return response.data
}

export const editarResenia = async (guid, body) => {
  const response = await apiClient.put(`/resenias/${guid}`, body)
  return response.data
}

export const eliminarResenia = async (guid) => {
  const response = await apiClient.delete(`/resenias/${guid}`)
  return response.data
}
