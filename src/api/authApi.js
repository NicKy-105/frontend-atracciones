import { apiClient } from './atraccionesApi'

export const login = async (loginValue, password) => {
  const response = await apiClient.post('/auth/login', {
    login: loginValue,
    password,
  })
  return response.data
}

export const registro = async (loginValue, password) => {
  const response = await apiClient.post('/auth/registro', {
    login: loginValue,
    password,
  })
  return response.data
}
