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

// Store для избранного
export const useFavoritesStore = create(
  persist(
    (set, get) => ({
      favorites: [],
      
      addToFavorites: (product) => {
        const { favorites } = get()
        if (!favorites.find(p => p.id === product.id)) {
          set({ favorites: [...favorites, product] })
          return true
        }
        return false
      },
      
      removeFromFavorites: (productId) => {
        set({ favorites: get().favorites.filter(p => p.id !== productId) })
      },
      
      isFavorite: (productId) => {
        return get().favorites.some(p => p.id === productId)
      },
      
      clearFavorites: () => {
        set({ favorites: [] })
      }
    }),
    {
      name: 'partsauto-favorites',
    }
  )
)
