import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
          set({
            cartItems: cartItems.map(item =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          })
          return { success: true, message: 'Количество товара увеличено', isNew: false }
        } else {
          // Добавляем новый товар
          set({ cartItems: [...cartItems, { product, quantity }] })
          return { success: true, message: 'Товар добавлен в корзину', isNew: true }
        }
      },
      
      // Удалить товар из корзины
      removeFromCart: (productId) => {
        set({ cartItems: get().cartItems.filter(item => item.product.id !== productId) })
      },
      
      // Обновить количество товара
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId)
          return
        }
        
        set({
          cartItems: get().cartItems.map(item =>
            item.product.id === productId
              ? { ...item, quantity }
              : item
          )
        })
      },
      
      // Очистить корзину
      clearCart: () => {
        set({ cartItems: [] })
      },
      
      // Проверить наличие товара в корзине
      isInCart: (productId) => {
        return get().cartItems.some(item => item.product.id === productId)
      },
      
      // Получить количество товара в корзине
      getItemQuantity: (productId) => {
        const item = get().cartItems.find(item => item.product.id === productId)
        return item ? item.quantity : 0
      },
      
      // Общее количество товаров (с учетом количества)
      get totalItems() {
        return get().cartItems.reduce((sum, item) => sum + item.quantity, 0)
      },
      
      // Общая сумма корзины
      get totalPrice() {
        return get().cartItems.reduce((sum, item) => {
          const price = parseInt(item.product.price) || 0
          return sum + (price * item.quantity)
        }, 0)
      }
    }),
    {
      name: 'partsauto-cart',
    }
  )
)
