import { create } from 'zustand'
import type { User, UserRole } from '../types/auth'

interface AuthStore {
  user: User | null
  role: UserRole
  isAuthenticated: boolean
  setUser: (user: User) => void
  setRole: (role: UserRole) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  role: 'citizen',
  isAuthenticated: false,
  setUser: (user) =>
    set({
      user,
      isAuthenticated: true,
    }),
  setRole: (role) => set({ role }),
  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
    }),
}))
