import React, { useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '../store/useCartStore'
import toast from 'react-hot-toast'
import './cart-styles.css'

// Компонент панели корзины (модальное окно)
const CartPanel = ({ isOpen, onClose }) => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice } = useCartStore()

  const formatPrice = useCallback((price) => {
    if (!price) return '0 ₽'
    return `${parseInt(price).toLocaleString('ru-RU')} ₽`
  }, [])

  const getImageUrl = useCallback((img) => {
    if (!img) return ''
    if (typeof img === 'object') {
      return img['@_url'] || img.url || ''
    }
    return img
  }, [])

  const handleRemove = useCallback((productId, productTitle) => {
    removeFromCart(productId)
    toast.success(`${productTitle} удален из корзины`)
  }, [removeFromCart])

  const handleQuantityChange = useCallback((productId, newQuantity) => {
    if (newQuantity < 1) return
    updateQuantity(productId, newQuantity)
  }, [updateQuantity])

  const handleClearCart = useCallback(() => {
    if (window.confirm('Очистить корзину?')) {
      clearCart()
      toast.success('Корзина очищена')
    }
  }, [clearCart])

  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }, [onClose])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleBackdropClick}
        style={{ zIndex: 1050 }}
      >
        <motion.div
          className="cart-panel"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="cart-panel-header">
            <h4 className="mb-0">
              <i className="bi bi-cart3"></i> Корзина {totalItems > 0 && `(${totalItems})`}
            </h4>
            <button className="btn-close-custom" onClick={onClose} aria-label="Закрыть">
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <div className="cart-panel-body">
            {cartItems.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-cart-x display-1 text-muted"></i>
                <h5 className="mt-3 text-muted">Корзина пуста</h5>
                <p className="text-muted">Добавьте товары в корзину</p>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cartItems.map((item) => (
                    <div key={item.product.id} className="cart-item">
                      <div className="cart-item-image">
                        {item.product.images && item.product.images.length > 0 ? (
                          <img
                            src={getImageUrl(item.product.images[0])}
                            alt={item.product.title}
                            loading="lazy"
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23e9ecef" width="80" height="80"/%3E%3Ctext fill="%236c757d" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="12"%3EНет фото%3C/text%3E%3C/svg%3E'
                            }}
                          />
                        ) : (
                          <div className="no-image">
                            <i className="bi bi-image"></i>
                          </div>
                        )}
                      </div>

                      <div className="cart-item-details">
                        <h6 className="cart-item-title">{item.product.title}</h6>
                        <div className="cart-item-price">
                          {formatPrice(item.product.price)}
                        </div>
                        
                        <div className="cart-item-controls">
                          <div className="quantity-controls">
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <i className="bi bi-dash"></i>
                            </button>
                            <span className="quantity-value">{item.quantity}</span>
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                            >
                              <i className="bi bi-plus"></i>
                            </button>
                          </div>
                          
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleRemove(item.product.id, item.product.title)}
                            title="Удалить"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-panel-footer">
                  <div className="cart-total">
                    <span>Итого:</span>
                    <strong>{formatPrice(totalPrice)}</strong>
                  </div>
                  
                  <div className="d-grid gap-2">
                    <button className="btn btn-primary">
                      <i className="bi bi-check-circle"></i> Оформить заказ
                    </button>
                    <button 
                      className="btn btn-outline-danger btn-sm"
                      onClick={handleClearCart}
                    >
                      <i className="bi bi-trash"></i> Очистить корзину
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default React.memo(CartPanel)
