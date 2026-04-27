import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaPhone } from 'react-icons/fa'
import { useCartStore } from '../store/useCartStore'
import toast from 'react-hot-toast'
import { formatPrice, getImageUrl } from '../utils/formatters'
import styles from './ProductModal.module.css'

const ProductModal = ({ product, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { addToCart, isInCart } = useCartStore()
  
  if (!product) return null

  const images = product.images || []
  const hasImages = images.length > 0

  const handleAddToCart = useCallback(() => {
    if (isInCart(product.id)) {
      toast.error('Товар уже в корзине', { icon: '🛒' })
    } else {
      const result = addToCart(product)
      if (result.success) {
        toast.success('Товар добавлен в корзину', { icon: '🛒' })
      }
    }
  }, [product, addToCart, isInCart])

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  return (
    <AnimatePresence>
      <motion.div
        className={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleBackdropClick}
      >
        <motion.div
          className={styles.modal}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <div className={styles.header}>
            <h3 className={styles.title}>{product.title}</h3>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Закрыть">
              ✕
            </button>
          </div>

          <div className={styles.body}>
            <div className={styles.grid}>
              {/* Галерея изображений */}
              <div className={styles.gallery}>
                {hasImages ? (
                  <>
                    <div className={styles.mainImage}>
                      <img
                        src={getImageUrl(images[currentImageIndex])}
                        alt={`${product.title} - фото ${currentImageIndex + 1}`}
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23e9ecef" width="400" height="400"/%3E%3Ctext fill="%236c757d" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="20"%3EНет изображения%3C/text%3E%3C/svg%3E'
                        }}
                      />
                    </div>
                    {images.length > 1 && (
                      <div className={styles.thumbnailGallery}>
                        {images.map((img, index) => (
                          <div
                            key={index}
                            className={`${styles.thumbnail} ${index === currentImageIndex ? styles.active : ''}`}
                            onClick={() => setCurrentImageIndex(index)}
                          >
                            <img
                              src={getImageUrl(img)}
                              alt={`Миниатюра ${index + 1}`}
                              loading="lazy"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    {images.length > 1 && (
                      <>
                        <button
                          className={`${styles.sliderNav} ${styles.sliderPrev}`}
                          onClick={handlePrevImage}
                          aria-label="Предыдущее изображение"
                        >
                          ‹
                        </button>
                        <button
                          className={`${styles.sliderNav} ${styles.sliderNext}`}
                          onClick={handleNextImage}
                          aria-label="Следующее изображение"
                        >
                          ›
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className={styles.noImage}>
                    <div>Нет изображений</div>
                  </div>
                )}
              </div>

              {/* Информация о товаре */}
              <div className={styles.info}>
                <div className={styles.priceSection}>
                  {product.price ? (
                    <div className={styles.priceValue}>{formatPrice(product.price)}</div>
                  ) : (
                    <div className={styles.priceRequest}>Цена по запросу</div>
                  )}
                </div>

                <div className={styles.details}>
                  <h5 className={styles.sectionTitle}>Характеристики</h5>
                  <table className={styles.detailsTable}>
                    <tbody>
                      {product.brand && (
                        <tr>
                          <td className={styles.label}>Бренд:</td>
                          <td className={styles.value}><strong>{product.brand}</strong></td>
                        </tr>
                      )}
                      {product.category && (
                        <tr>
                          <td className={styles.label}>Категория:</td>
                          <td className={styles.value}>{product.category}</td>
                        </tr>
                      )}
                      {(product.carMake || product.carModel) && (
                        <tr>
                          <td className={styles.label}>Автомобиль:</td>
                          <td className={styles.value}>{product.carMake} {product.carModel}</td>
                        </tr>
                      )}
                      {product.generation && (
                        <tr>
                          <td className={styles.label}>Поколение:</td>
                          <td className={styles.value}>{product.generation}</td>
                        </tr>
                      )}
                      {product.condition && (
                        <tr>
                          <td className={styles.label}>Состояние:</td>
                          <td className={styles.value}>
                            <span className={styles.badge}>{product.condition}</span>
                          </td>
                        </tr>
                      )}
                      {product.originalVendor && (
                        <tr>
                          <td className={styles.label}>Производитель:</td>
                          <td className={styles.value}>{product.originalVendor}</td>
                        </tr>
                      )}
                      {product.installationLocation && (
                        <tr>
                          <td className={styles.label}>Расположение:</td>
                          <td className={styles.value}>{product.installationLocation}</td>
                        </tr>
                      )}
                      {product.address && (
                        <tr>
                          <td className={styles.label}>Адрес:</td>
                          <td className={styles.value}>📍 {product.address}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {product.description && (
                  <div className={styles.description}>
                    <h5 className={styles.sectionTitle}>Описание</h5>
                    <p>{product.description}</p>
                  </div>
                )}

                <div className={styles.actionButtons}>
                  <button
                    className={`${styles.cartBtn} ${isInCart(product.id) ? styles.cartBtnInCart : styles.cartBtnNotInCart}`}
                    onClick={handleAddToCart}
                  >
                    {isInCart(product.id) ? '✓ Товар в корзине' : '+ Добавить в корзину'}
                  </button>
                </div>

                <div className={styles.contactSection}>
                  <h6 className={styles.contactTitle}>Связаться с продавцом</h6>
                  <div className={styles.contactButtons}>
                    <a href="tel:+79826048040" className={styles.contactPhone}>
                      <FaPhone className={styles.phoneIcon} />
                      Позвонить
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ProductModal
