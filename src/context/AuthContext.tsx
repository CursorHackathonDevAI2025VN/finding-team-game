import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { authApi } from '../services/api'
import type { User, RegisterRequest, LoginRequest } from '../types'

interface AuthContextType {
  user: Omit<User, 'password'> | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  isLeader: boolean
  isMember: boolean
  login: (data: LoginRequest) => Promise<Omit<User, 'password'>>
  register: (data: RegisterRequest) => Promise<Omit<User, 'password'>>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Omit<User, 'password'> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const userData = await authApi.getMe()
      setUser(userData)
    } catch {
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = async (data: LoginRequest) => {
    setLoading(true)
    setError(null)
    try {
      const result = await authApi.login(data)
      setUser(result.user)
      return result.user
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const register = async (data: RegisterRequest) => {
    setLoading(true)
    setError(null)
    try {
      const result = await authApi.register(data)
      setUser(result.user)
      return result.user
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    authApi.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated: !!user,
        isLeader: user?.role === 'leader',
        isMember: user?.role === 'member',
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return context
}

