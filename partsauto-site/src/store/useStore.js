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

// Store для сравнения товаров
export const useCompareStore = create(
  persist(
    (set, get) => ({
      compareList: [],
      maxCompareItems: 4,
      
      addToCompare: (product) => {
        const { compareList, maxCompareItems } = get()
        if (compareList.length >= maxCompareItems) {
          return { success: false, message: `Можно сравнить максимум ${maxCompareItems} товара` }
        }
        if (!compareList.find(p => p.id === product.id)) {
          set({ compareList: [...compareList, product] })
          return { success: true, message: 'Товар добавлен к сравнению' }
        }
        return { success: false, message: 'Товар уже в списке сравнения' }
      },
      
      removeFromCompare: (productId) => {
        set({ compareList: get().compareList.filter(p => p.id !== productId) })
      },
      
      isInCompare: (productId) => {
        return get().compareList.some(p => p.id === productId)
      },
      
      clearCompare: () => {
        set({ compareList: [] })
      }
    }),
    {
      name: 'partsauto-compare',
    }
  )
)
