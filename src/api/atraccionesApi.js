import axios from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status

    if (status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    } else if (status === 403) {
      window.dispatchEvent(
        new CustomEvent('app:toast', {
          detail: { id: Date.now(), message: 'No tienes permisos para esta acción', type: 'error' },
        }),
      )
      window.location.href = '/'
    } else if (status >= 500) {
      window.dispatchEvent(
        new CustomEvent('app:toast', {
          detail: {
            id: Date.now(),
            message: 'Error del servidor. Intenta nuevamente.',
            type: 'error',
          },
        }),
      )
    }
    // 409 y otros se manejan en cada hook
    return Promise.reject(error)
  },
)

export const listarAtracciones = async (params = {}) => {
  const response = await apiClient.get('/atracciones', { params })
  return response.data
}

export const obtenerFiltros = async (ciudad) => {
  const response = await apiClient.get('/atracciones/filtros', {
    params: { ciudad },
  })
  return response.data
}

export const obtenerAtraccion = async (guid) => {
  const response = await apiClient.get(`/atracciones/${guid}`)
  return response.data
}
