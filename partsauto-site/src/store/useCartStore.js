import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Функция для пересчёта итогов
const calculateTotals = (cartItems) => {
  let totalItems = 0
  let totalPrice = 0
  let hasRequestPrice = false
  
  cartItems.forEach(item => {
    totalItems += item.quantity
    const price = parseInt(item.product.price)
    
    if (!price || price === 0) {
      hasRequestPrice = true
    } else {
      totalPrice += price * item.quantity
    }
  })
  
  return { totalItems, totalPrice, hasRequestPrice }
}

// Store для корзины
export const useCartStore = create(
  persist(
    (set, get) => ({
      cartItems: [], // Массив объектов { product, quantity }
      totalItems: 0,
      totalPrice: 0,
      hasRequestPrice: false, // Флаг: есть ли товары "Цена по запросу"
      
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
        const { totalItems, totalPrice, hasRequestPrice } = calculateTotals(get().cartItems)
        set({ totalItems, totalPrice, hasRequestPrice })
        
        return { success: true, message: existingItem ? 'Количество товара увеличено' : 'Товар добавлен в корзину', isNew: !existingItem }
      },
      
      // Удалить товар из корзины
      removeFromCart: (productId) => {
        const { cartItems } = get()
        const updatedItems = cartItems.filter(item => item.product.id !== productId)
        set({ cartItems: updatedItems })
        
        // Пересчитать итоги
        const { totalItems, totalPrice, hasRequestPrice } = calculateTotals(updatedItems)
        set({ totalItems, totalPrice, hasRequestPrice })
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
        const { totalItems, totalPrice, hasRequestPrice } = calculateTotals(updatedItems)
        set({ totalItems, totalPrice, hasRequestPrice })
      },
      
      // Пересчитать итоги корзины
      updateCartTotals: () => {
        const { cartItems } = get()
        const { totalItems, totalPrice, hasRequestPrice } = calculateTotals(cartItems)
        set({ totalItems, totalPrice, hasRequestPrice })
      },
      
      // Очистить корзину
      clearCart: () => {
        set({ cartItems: [], totalItems: 0, totalPrice: 0, hasRequestPrice: false })
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
        totalPrice: state.totalPrice,
        hasRequestPrice: state.hasRequestPrice
      }),
    }
  )
)
