import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useCartStore } from '../store/useCartStore'
import toast from 'react-hot-toast'
import { CARD_ANIMATION_DELAY } from '../config'
import styles from './ProductCard.module.css'

// Компонент слайдера изображений для карточки товара
const ProductImageSlider = React.memo(({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const getImageUrl = useCallback((img) => {
    if (typeof img === 'object') {
      return img['@_url'] || img.url || ''
    }
    return img || ''
  }, [])

  if (!images || images.length === 0) {
    return (
      <div className={styles.productImageFallback}>
        <div className={styles.productImageFallbackIcon}>
          <i className="bi bi-image"></i>
        </div>
        <div className={styles.productImageFallbackText}>Нет фото</div>
      </div>
    )
  }

  const goToPrevious = (e) => {
    e.stopPropagation()
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    )
  }

  const goToNext = (e) => {
    e.stopPropagation()
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    )
  }

  const goToSlide = (e, index) => {
    e.stopPropagation()
    setCurrentIndex(index)
  }

  const currentImage = images[currentIndex]
  const imageUrl = getImageUrl(currentImage)

  return (
    <div className={styles.productImageSlider}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={`${title} - фото ${currentIndex + 1}`}
          className={styles.productImage}
          loading="lazy"
          onError={(e) => {
            e.target.style.display = 'none'
            const fallback = e.target.parentElement.querySelector(`.${styles.imageFallback}`)
            if (fallback) fallback.style.display = 'flex'
          }}
        />
      ) : (
        <div className={styles.productImageFallback}>
          <div className={styles.productImageFallbackIcon}>
            <i className="bi bi-image"></i>
          </div>
          <div className={styles.productImageFallbackText}>Нет фото</div>
        </div>
      )}

      <div className={`${styles.productImageFallback} ${styles.imageFallback}`} style={{ display: 'none' }}>
        <div className={styles.productImageFallbackIcon}>
          <i className="bi bi-image"></i>
        </div>
        <div className={styles.productImageFallbackText}>Ошибка загрузки</div>
      </div>

      {images.length > 1 && (
        <>
          <button
            className={`${styles.sliderNav} ${styles.sliderPrev}`}
            onClick={goToPrevious}
            aria-label="Предыдущее фото"
          >
            <i className="bi bi-chevron-left"></i>
          </button>
          <button
            className={`${styles.sliderNav} ${styles.sliderNext}`}
            onClick={goToNext}
            aria-label="Следующее фото"
          >
            <i className="bi bi-chevron-right"></i>
          </button>

          <div className={styles.sliderIndicators}>
            {images.map((_, index) => (
              <button
                key={index}
                className={`${styles.indicator} ${index === currentIndex ? styles.activeIndicator : ''}`}
                onClick={(e) => goToSlide(e, index)}
                aria-label={`Перейти к фото ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
})

ProductImageSlider.displayName = 'ProductImageSlider'

// Основной компонент карточки товара
const ProductCard = ({ product, index, onProductClick }) => {
  const { addToCart, isInCart } = useCartStore()

  const formatPrice = useCallback((price) => {
    if (!price) return 'Цена не указана'
    return `${parseInt(price).toLocaleString('ru-RU')} ₽`
  }, [])

  // Обработчик добавления в корзину (заменяет избранное)
  const handleAddToCart = useCallback((e) => {
    e.stopPropagation()
    
    if (isInCart(product.id)) {
      toast.error('Товар уже в корзине', { icon: '🛒' })
    } else {
      const result = addToCart(product)
      if (result.success) {
        toast.success('Товар добавлен в корзину', { icon: '🛒' })
      }
    }
  }, [product, addToCart, isInCart])

  const handleCardClick = useCallback(() => {
    onProductClick(product)
  }, [product, onProductClick])

  return (
    <motion.div
      className={styles.productCardWrapper}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * CARD_ANIMATION_DELAY }}
    >
      <div className={styles.card}>
        <div
          onClick={handleCardClick}
          style={{ cursor: 'pointer' }}
        >
          <ProductImageSlider images={product.images} title={product.title} />
        </div>

        <div className={styles.cardBody}>
          <h6 className={styles.cardTitle} onClick={handleCardClick} style={{ cursor: 'pointer' }}>
            {product.title}
          </h6>

          <div className={styles.priceContainer}>
            {product.price ? (
              <span className={styles.priceBadge}>{formatPrice(product.price)}</span>
            ) : (
              <span className={styles.priceRequest}>Цена по запросу</span>
            )}
          </div>

          <div className={styles.productInfo}>
            {product.brand && (
              <div><i className="bi bi-tag"></i> {product.brand}</div>
            )}
            {(product.carMake || product.carModel) && (
              <div><i className="bi bi-car-front"></i> {product.carMake} {product.carModel}</div>
            )}
            {product.generation && (
              <div><i className="bi bi-info-circle"></i> {product.generation}</div>
            )}
            {product.condition && (
              <div>
                <i className="bi bi-box"></i>{' '}
                <span className={product.condition.includes('Нов') ? styles.textSuccess : styles.textInfo}>
                  {product.condition}
                </span>
              </div>
            )}
          </div>

          {product.category && (
            <span className={styles.categoryBadge}>
              {product.category}
            </span>
          )}

          <div className={styles.cartBtnContainer}>
            <div className={styles.cartBtnRow}>
              {/* Кнопка добавления в корзину (заменяет избранное) */}
              <button
                className={`${styles.cartBtn} ${isInCart(product.id) ? styles.cartBtnFilled : styles.cartBtnOutline}`}
                onClick={handleAddToCart}
                title={isInCart(product.id) ? 'Товар в корзине' : 'Добавить в корзину'}
              >
                <i className={`bi ${isInCart(product.id) ? 'bi-cart-check-fill' : 'bi-cart-plus'}`}></i>
                {isInCart(product.id) ? ' В корзине' : ' В корзину'}
              </button>
            </div>

            {product.address && (
              <div className={styles.address}>
                <i className="bi bi-geo-alt"></i> {product.address}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default React.memo(ProductCard)
