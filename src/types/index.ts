// Define your app types here

export type UserRole = 'citizen' | 'lawyer' | 'social-worker'

export interface User {
  id: string
  email: string
  role: UserRole
  name: string
}

export interface LoginFormData {
  email: string
  password: string
}

export interface AuthState {
  user: User | null
  role: UserRole
  isAuthenticated: boolean
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
