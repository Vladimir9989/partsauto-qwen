import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Store для темы
export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'light', // 'light' | 'dark' | 'auto'
      
      setTheme: (newTheme) => {
        set({ theme: newTheme })
        applyTheme(newTheme)
      },
      
      toggleTheme: () => {
        const current = get().theme
        const newTheme = current === 'light' ? 'dark' : 'light'
        set({ theme: newTheme })
        applyTheme(newTheme)
      },
      
      initTheme: () => {
        const theme = get().theme
        applyTheme(theme)
      }
    }),
    {
      name: 'partsauto-theme',
    }
  )
)

// Применение темы к документу
const applyTheme = (theme) => {
  if (theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
  } else {
    document.documentElement.setAttribute('data-theme', theme)
  }
}
