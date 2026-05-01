/**
 * context/AuthContext.jsx
 * Connects WebSocket on login, disconnects on logout.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '@/lib/api'
import { setToken, clearToken, getToken } from '@/lib/auth'
import { socket } from '@/lib/socket'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (token) {
      authApi.me()
        .then(u => { setUser(u); socket.connect(token) })
        .catch(() => clearToken())
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }

    const handleExpired = () => { setUser(null); clearToken(); socket.disconnect() }
    window.addEventListener('auth:expired', handleExpired)
    return () => window.removeEventListener('auth:expired', handleExpired)
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await authApi.login({ email, password })
    setToken(data.token)
    setUser(data.user)
    socket.connect(data.token)
    return data.user
  }, [])

  const register = useCallback(async (body) => {
    const data = await authApi.register(body)
    setToken(data.token)
    setUser(data.user)
    socket.connect(data.token)
    return data.user
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
    socket.disconnect()
  }, [])

  const updateUser = useCallback((fields) => {
    setUser(prev => ({ ...prev, ...fields }))
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}