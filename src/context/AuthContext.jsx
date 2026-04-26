import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [token, setToken] = useState(null)

  useEffect(() => {
    const tokenGuardado = localStorage.getItem('token')
    const usuarioGuardado = localStorage.getItem('usuario')

    if (tokenGuardado) {
      setToken(tokenGuardado)
    }
    if (usuarioGuardado) {
      try {
        const usuarioParseado = JSON.parse(usuarioGuardado)
        setUsuario({
          login: usuarioParseado?.login || '',
          roles:
            usuarioParseado?.roles ||
            (usuarioParseado?.rol ? [usuarioParseado.rol] : []),
        })
      } catch {
        localStorage.removeItem('usuario')
      }
    }
  }, [])

  const login = (nuevoToken, nuevoUsuario) => {
    const usuarioNormalizado = {
      login: nuevoUsuario?.login || '',
      roles: nuevoUsuario?.roles || [],
    }
    setToken(nuevoToken)
    setUsuario(usuarioNormalizado)
    localStorage.setItem('token', nuevoToken)
    localStorage.setItem('usuario', JSON.stringify(usuarioNormalizado))
  }

  const logout = () => {
    setToken(null)
    setUsuario(null)
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
  }

  const value = useMemo(
    () => ({
      usuario,
      token,
      login,
      logout,
      estaAutenticado: Boolean(token),
    }),
    [token, usuario],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext debe usarse dentro de AuthProvider')
  }
  return context
}
