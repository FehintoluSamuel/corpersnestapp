import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '@/lib/api'
import { setToken, clearToken, getToken } from '@/lib/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // On mount, if token exists, fetch current user
  useEffect(() => {
    const token = getToken()
    if (token) {
      authApi.me()
        .then(setUser)
        .catch(() => clearToken())
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }

    // Listen for token expiry fired from api.js
    const handleExpired = () => {
      setUser(null)
      clearToken()
    }
    window.addEventListener('auth:expired', handleExpired)
    return () => window.removeEventListener('auth:expired', handleExpired)
  }, [])

const login = useCallback(async (email, password) => {
  const data = await authApi.login({ email, password })
  setToken(data.token)        // ← was data.access_token
  setUser(data.user)
  return data.user
}, [])

const register = useCallback(async (body) => {
  const data = await authApi.register(body)
  setToken(data.token)        // ← was data.access_token
  setUser(data.user)
  return data.user
}, [])

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}