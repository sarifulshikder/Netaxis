import { User } from '@/types'

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access_token')
}

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('refresh_token')
}

export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('access_token', accessToken)
  localStorage.setItem('refresh_token', refreshToken)
}

export const clearTokens = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user_role')
  localStorage.removeItem('user_data')
}

export const isAuthenticated = (): boolean => {
  return !!getToken()
}

export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null
  const data = localStorage.getItem('user_data')
  if (!data) return null
  try { return JSON.parse(data) } catch { return null }
}

export const setUser = (user: User) => {
  localStorage.setItem('user_data', JSON.stringify(user))
  localStorage.setItem('user_role', user.role)
}

export const getRole = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('user_role')
}
