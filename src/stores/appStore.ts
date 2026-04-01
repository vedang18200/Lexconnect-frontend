import { create } from 'zustand'

interface AppState {
  darkMode: boolean
  toggleDarkMode: () => void
  // Add more global state as needed
}

export const useAppStore = create<AppState>((set) => ({
  darkMode: false,
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
}))
