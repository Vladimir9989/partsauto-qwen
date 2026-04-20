import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Функция для пересчёта итогов
const calculateTotals = (cartItems) => {
  let totalItems = 0
  let totalPrice = 0
  
  cartItems.forEach(item => {
    totalItems += item.quantity
    const price = parseInt(item.product.price) || 0
    totalPrice += price * item.quantity
  })
  
  return { totalItems, totalPrice }
}

// Store для корзины
export const useCartStore = create(
  persist(
    (set, get) => ({
      cartItems: [], // Массив объектов { product, quantity }
      
      // Добавить товар в корзину
      addToCart: (product, quantity = 1) => {
        const { cartItems } = get()
        const existingItem = cartItems.find(item => item.product.id === product.id)
        
        if (existingItem) {
          // Увеличиваем количество существующего товара
          const updatedItems = cartItems.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
          set({ cartItems: updatedItems })
        } else {
          // Добавляем новый товар
          set({ cartItems: [...cartItems, { product, quantity }] })
        }
        
        // Пересчитать итоги
        const { totalItems, totalPrice } = calculateTotals(get().cartItems)
        set({ totalItems, totalPrice })
        
        return { success: true, message: existingItem ? 'Количество товара увеличено' : 'Товар добавлен в корзину', isNew: !existingItem }
      },
      
      // Удалить товар из корзины
      removeFromCart: (productId) => {
        const { cartItems } = get()
        const updatedItems = cartItems.filter(item => item.product.id !== productId)
        set({ cartItems: updatedItems })
        
        // Пересчитать итоги
        const { totalItems, totalPrice } = calculateTotals(updatedItems)
        set({ totalItems, totalPrice })
      },
      
      // Обновить количество товара
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId)
          return
        }
        
        const { cartItems } = get()
        const updatedItems = cartItems.map(item =>
          item.product.id === productId
            ? { ...item, quantity }
            : item
        )
        set({ cartItems: updatedItems })
        
        // Пересчитать итоги
        const { totalItems, totalPrice } = calculateTotals(updatedItems)
        set({ totalItems, totalPrice })
      },
      
      // Пересчитать итоги корзины
      updateCartTotals: () => {
        const { cartItems } = get()
        const { totalItems, totalPrice } = calculateTotals(cartItems)
        set({ totalItems, totalPrice })
      },
      
      // Очистить корзину
      clearCart: () => {
        set({ cartItems: [], totalItems: 0, totalPrice: 0 })
      },
      
      // Проверить наличие товара в корзине
      isInCart: (productId) => {
        const { cartItems } = get()
        return cartItems.some(item => item.product.id === productId)
      },
      
      // Получить количество товара в корзине
      getItemQuantity: (productId) => {
        const { cartItems } = get()
        const item = cartItems.find(item => item.product.id === productId)
        return item ? item.quantity : 0
      },
      
      // Загрузить корзину из localStorage (вызывается автоматически при инициализации persist)
      loadCartFromStorage: () => {
        // persist автоматически загружает данные при монтировании
      }
    }),
    {
      name: 'partsauto-cart',
      // Настройки persist middleware
      partialize: (state) => ({
        cartItems: state.cartItems,
        totalItems: state.totalItems,
        totalPrice: state.totalPrice
      }),
    }
  )
)
