import { useState, useCallback, useMemo } from 'react'
import { useCartStore } from '../store/useCartStore'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import styles from './CartPage.module.css'

function CartPage() {
  const navigate = useNavigate()
  const { cartItems, removeFromCart, clearCart, hasRequestPrice } = useCartStore()
  const [activeTab, setActiveTab] = useState('pickup')
  const [pickupPoint, setPickupPoint] = useState('ekb')
  const [form, setForm] = useState({ name: '', phone: '', email: '', comment: '', city: '' })
  const [agree, setAgree] = useState(false)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Пересчитываем общую сумму (без учёта количества, т.к. оно всегда 1)
  const actualTotalPrice = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = parseInt(item.product.price) || 0
      return sum + price
    }, 0)
  }, [cartItems])

  const formatPrice = useCallback((price) => {
    if (!price || price === 0) return 'Цена по запросу'
    return `${parseInt(price).toLocaleString('ru-RU')} ₽`
  }, [])

  const getImageUrl = useCallback((img) => {
    if (!img) return ''
    if (typeof img === 'object') {
      return img['@_url'] || img.url || ''
    }
    return img
  }, [])

  const handleRemove = useCallback((productId) => {
    removeFromCart(productId)
  }, [removeFromCart])

  const formatPhoneNumber = (value) => {
    // Удаляем все символы кроме цифр
    let cleaned = value.replace(/\D/g, '')
    
    // Если первая цифра 8 или 9, заменяем на 7
    if (cleaned.length > 0 && (cleaned[0] === '8' || cleaned[0] === '9')) {
      cleaned = '7' + cleaned.slice(1)
    }
    
    // Если нет первой цифры, добавляем 7
    if (cleaned.length === 0) {
      return '+7'
    }
    
    // Если первая цифра не 7, добавляем 7 в начало
    if (cleaned[0] !== '7') {
      cleaned = '7' + cleaned
    }
    
    // Ограничиваем до 11 цифр (7 + 10 цифр номера)
    const limited = cleaned.slice(0, 11)
    
    // Применяем маску: +7 (XXX) XXX-XX-XX
    if (limited.length === 1) return '+' + limited
    if (limited.length <= 4) return '+' + limited.slice(0, 1) + ' (' + limited.slice(1)
    if (limited.length <= 7) return '+' + limited.slice(0, 1) + ' (' + limited.slice(1, 4) + ') ' + limited.slice(4)
    if (limited.length <= 9) return '+' + limited.slice(0, 1) + ' (' + limited.slice(1, 4) + ') ' + limited.slice(4, 7) + '-' + limited.slice(7)
    return '+' + limited.slice(0, 1) + ' (' + limited.slice(1, 4) + ') ' + limited.slice(4, 7) + '-' + limited.slice(7, 9) + '-' + limited.slice(9)
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    let formattedValue = value
    
    // Применяем маску для телефона
    if (name === 'phone') {
      formattedValue = formatPhoneNumber(value)
    }
    
    setForm(prev => ({ ...prev, [name]: formattedValue }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Имя обязательно'
    if (!form.phone.trim()) newErrors.phone = 'Телефон обязателен'
    else if (!/^[\d\s\-\+\(\)]+$/.test(form.phone)) newErrors.phone = 'Некорректный номер телефона'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Некорректный email'
    if (!agree) newErrors.agree = 'Необходимо согласиться с политикой конфиденциальности'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmitOrder = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    if (cartItems.length === 0) {
      toast.error('Корзина пуста')
      return
    }

    setIsSubmitting(true)

    const orderData = {
      items: cartItems.map(item => ({ ...item.product, quantity: 1 })),
      totalPrice: actualTotalPrice,
      deliveryType: activeTab === 'pickup' ? 'Самовывоз' : 'Доставка',
      pickupPoint: activeTab === 'pickup' ? (pickupPoint === 'ekb' ? 'Екатеринбург' : 'Реж') : null,
      city: activeTab === 'delivery' ? form.city : null,
      name: form.name,
      phone: form.phone,
      email: form.email || null,
      comment: form.comment,
      timestamp: new Date().toISOString()
    }

    try {
      const response = await fetch('/api/send-order-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка отправки заказа')
      }

      // Успешная отправка
      toast.success('Заказ успешно оформлен! Менеджер свяжется с вами в ближайшее время.')
      
      // Очищаем корзину
      clearCart()
      
      // Перенаправляем на главную через 2 секунды
      setTimeout(() => {
        navigate('/')
      }, 2000)
    } catch (error) {
      console.error('Ошибка при отправке заказа:', error)
      toast.error(`Ошибка: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Корзина - PartsAuto</title>
        <meta name="description" content="Оформление заказа" />
      </Helmet>

      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          <Link to="/" className={styles.backLink}>
            <i className="bi bi-arrow-left"></i> Вернуться на главную
          </Link>
          <div className={styles.header}>
            <h1>Оформление заказа</h1>
            <p className={styles.subtitle}>Проверьте товары и заполните данные для доставки</p>
          </div>

          <div className={styles.content}>
            {/* Левая колонка - товары */}
            <div className={styles.cartSection}>
              <h2 className={styles.sectionTitle}>Товары в корзине</h2>

              {cartItems.length === 0 ? (
                <div className={styles.emptyCart}>
                  <i className="bi bi-cart-x"></i>
                  <h3>Корзина пуста</h3>
                  <p>Добавьте товары в корзину для оформления заказа</p>
                </div>
              ) : (
                <>
                  <div className={styles.cartItems}>
                    {cartItems.map((item) => (
                      <div key={item.product.id} className={styles.cartItem}>
                        <div className={styles.itemImage}>
                          {item.product.images && item.product.images.length > 0 ? (
                            <img
                              src={getImageUrl(item.product.images[0])}
                              alt={item.product.title}
                              loading="lazy"
                              onError={(e) => {
                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23e9ecef" width="100" height="100"/%3E%3Ctext fill="%236c757d" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="12"%3EНет фото%3C/text%3E%3C/svg%3E'
                              }}
                            />
                          ) : (
                            <div className={styles.noImage}>
                              <i className="bi bi-image"></i>
                            </div>
                          )}
                        </div>

                        <div className={styles.itemDetails}>
                          <h4 className={styles.itemTitle}>{item.product.title}</h4>
                          <p className={styles.itemPrice}>{formatPrice(item.product.price)}</p>

                          <div className={styles.itemControls}>
                            <button
                              className={styles.removeBtn}
                              onClick={() => handleRemove(item.product.id)}
                              title="Удалить"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>

                        <div className={styles.itemTotal}>
                          {formatPrice(item.product.price)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.cartSummary}>
                    <div className={styles.summaryRow}>
                      <span>Сумма товаров:</span>
                      <strong>{hasRequestPrice && actualTotalPrice === 0 ? 'Цена по запросу' : formatPrice(actualTotalPrice)}</strong>
                    </div>
                    <div className={styles.summaryRow}>
                      <span>Доставка:</span>
                      <strong>Рассчитается после оформления</strong>
                    </div>
                    <div className={styles.summaryTotal}>
                      <span>Итого:</span>
                      <strong>{hasRequestPrice && actualTotalPrice === 0 ? 'Цена по запросу' : formatPrice(actualTotalPrice)}</strong>
                    </div>
                    {hasRequestPrice && (
                      <div style={{ marginTop: '12px', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '4px', fontSize: '12px', color: '#856404', border: '1px solid #ffeaa7' }}>
                        <i className="bi bi-exclamation-triangle" style={{ marginRight: '6px' }}></i>
                        <strong>Внимание!</strong> В вашей корзине есть товары с ценой "по запросу". Менеджер уточнит их стоимость при обработке заказа.
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Правая колонка - форма (без изменений) */}
            <div className={styles.formSection}>
              <form onSubmit={handleSubmitOrder} className={styles.form}>
                {/* Вкладки доставки */}
                <div className={styles.tabs}>
                  <button
                    type="button"
                    className={`${styles.tab} ${activeTab === 'pickup' ? styles.active : ''}`}
                    onClick={() => setActiveTab('pickup')}
                  >
                    <i className="bi bi-shop"></i> Заберу сам
                  </button>
                  <button
                    type="button"
                    className={`${styles.tab} ${activeTab === 'delivery' ? styles.active : ''}`}
                    onClick={() => setActiveTab('delivery')}
                  >
                    <i className="bi bi-truck"></i> Нужна доставка
                  </button>
                </div>

                <div className={styles.tabContent}>
                  {activeTab === 'pickup' ? (
                    <div className={styles.pickupSection}>
                      <h3 className={styles.formSubtitle}>Выберите пункт самовывоза</h3>
                      <div className={styles.radioGroup}>
                        <label className={styles.radioLabel}>
                          <input type="radio" name="pickupPoint" value="ekb" checked={pickupPoint === 'ekb'} onChange={(e) => setPickupPoint(e.target.value)} />
                          <span className={styles.radioCustom}></span>
                          <span className={styles.radioText}><strong>Екатеринбург</strong><small>ул. Ленина, 10</small></span>
                        </label>
                        <label className={styles.radioLabel}>
                          <input type="radio" name="pickupPoint" value="rezh" checked={pickupPoint === 'rezh'} onChange={(e) => setPickupPoint(e.target.value)} />
                          <span className={styles.radioCustom}></span>
                          <span className={styles.radioText}><strong>Реж</strong><small>ул. Советская, 5</small></span>
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.deliverySection}>
                      <h3 className={styles.formSubtitle}>Адрес доставки</h3>
                      <div className={styles.formGroup}>
                        <label htmlFor="city" className={styles.label}>Ваш город</label>
                        <input type="text" id="city" name="city" placeholder="Введите город" value={form.city || ''} onChange={(e) => setForm(prev => ({ ...prev, city: e.target.value }))} className={styles.input} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Поля формы (имя, телефон, email, комментарий) — без изменений */}
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.label}>Имя <span className={styles.required}>*</span></label>
                  <input type="text" id="name" name="name" placeholder="Ваше имя" value={form.name} onChange={handleFormChange} className={`${styles.input} ${errors.name ? styles.inputError : ''}`} />
                  {errors.name && <span className={styles.error}>{errors.name}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="phone" className={styles.label}>Телефон <span className={styles.required}>*</span></label>
                  <input type="tel" id="phone" name="phone" placeholder="+7 (999) 123-45-67" value={form.phone} onChange={handleFormChange} className={`${styles.input} ${errors.phone ? styles.inputError : ''}`} />
                  {errors.phone && <span className={styles.error}>{errors.phone}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>E-mail</label>
                  <input type="email" id="email" name="email" placeholder="your@email.com" value={form.email} onChange={handleFormChange} className={`${styles.input} ${errors.email ? styles.inputError : ''}`} />
                  {errors.email && <span className={styles.error}>{errors.email}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="comment" className={styles.label}>Комментарий</label>
                  <textarea id="comment" name="comment" placeholder="Дополнительная информация к заказу" value={form.comment} onChange={handleFormChange} className={styles.textarea} rows="4"></textarea>
                </div>

                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <input type="checkbox" checked={agree} onChange={(e) => { setAgree(e.target.checked); if (e.target.checked && errors.agree) setErrors(prev => ({ ...prev, agree: '' })) }} />
                    <span className={styles.checkboxCustom}></span>
                    <span className={styles.checkboxText}>Я согласен с <a href="#" className={styles.link}>политикой конфиденциальности</a><span className={styles.required}>*</span></span>
                  </label>
                  {errors.agree && <span className={styles.error}>{errors.agree}</span>}
                </div>

                <button type="submit" className={styles.submitBtn} disabled={cartItems.length === 0 || isSubmitting}>
                  <i className="bi bi-check-circle"></i> {isSubmitting ? 'Отправка...' : 'Оформить заказ'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CartPage