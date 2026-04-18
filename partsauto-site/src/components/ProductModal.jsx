import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFavoritesStore, useCompareStore } from '../store/useStore'
import toast from 'react-hot-toast'

const ProductModal = ({ product, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavoritesStore()
  const { addToCompare, removeFromCompare, isInCompare } = useCompareStore()
  
  if (!product) return null

  const images = product.images || []
  const hasImages = images.length > 0
  
  const getImageUrl = (img) => {
    if (typeof img === 'object') {
      return img['@_url'] || img.url || ''
    }
    return img || ''
  }

  const formatPrice = (price) => {
    if (!price) return 'Цена не указана'
    return `${parseInt(price).toLocaleString('ru-RU')} ₽`
  }

  const handleFavoriteToggle = () => {
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id)
      toast.success('Удалено из избранного', { icon: '💔' })
    } else {
      addToFavorites(product)
      toast.success('Добавлено в избранное', { icon: '❤️' })
    }
  }

  const handleCompareToggle = () => {
    if (isInCompare(product.id)) {
      removeFromCompare(product.id)
      toast.success('Удалено из сравнения')
    } else {
      const result = addToCompare(product)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleBackdropClick}
      >
        <motion.div
          className="modal-content-custom"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <div className="modal-header-custom">
            <h3 className="modal-title-custom">{product.title}</h3>
            <button className="btn-close-custom" onClick={onClose} aria-label="Закрыть">
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <div className="modal-body-custom">
            <div className="row">
              {/* Галерея изображений */}
              <div className="col-md-6">
                <div className="product-gallery">
                  {hasImages ? (
                    <>
                      <div className="main-image">
                        <img
                          src={getImageUrl(images[currentImageIndex])}
                          alt={`${product.title} - фото ${currentImageIndex + 1}`}
                          className="img-fluid"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23e9ecef" width="400" height="400"/%3E%3Ctext fill="%236c757d" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="20"%3EНет изображения%3C/text%3E%3C/svg%3E'
                          }}
                        />
                      </div>
                      {images.length > 1 && (
                        <div className="thumbnail-gallery">
                          {images.map((img, index) => (
                            <div
                              key={index}
                              className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                              onClick={() => setCurrentImageIndex(index)}
                            >
                              <img
                                src={getImageUrl(img)}
                                alt={`Миниатюра ${index + 1}`}
                                onError={(e) => {
                                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23e9ecef" width="80" height="80"/%3E%3C/svg%3E'
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="no-image-placeholder">
                      <i className="bi bi-image display-1 text-muted"></i>
                      <p className="text-muted mt-3">Нет изображений</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Информация о товаре */}
              <div className="col-md-6">
                <div className="product-info">
                  {/* Цена */}
                  <div className="price-section mb-4">
                    {product.price ? (
                      <h2 className="price-large text-primary">{formatPrice(product.price)}</h2>
                    ) : (
                      <h4 className="text-muted">Цена по запросу</h4>
                    )}
                  </div>

                  {/* Характеристики */}
                  <div className="product-details mb-4">
                    <h5 className="mb-3">Характеристики</h5>
                    <table className="table table-sm">
                      <tbody>
                        {product.brand && (
                          <tr>
                            <td className="text-muted">Бренд:</td>
                            <td><strong>{product.brand}</strong></td>
                          </tr>
                        )}
                        {product.category && (
                          <tr>
                            <td className="text-muted">Категория:</td>
                            <td>{product.category}</td>
                          </tr>
                        )}
                        {(product.carMake || product.carModel) && (
                          <tr>
                            <td className="text-muted">Автомобиль:</td>
                            <td>{product.carMake} {product.carModel}</td>
                          </tr>
                        )}
                        {product.generation && (
                          <tr>
                            <td className="text-muted">Поколение:</td>
                            <td>{product.generation}</td>
                          </tr>
                        )}
                        {product.condition && (
                          <tr>
                            <td className="text-muted">Состояние:</td>
                            <td>
                              <span className={product.condition.includes('Нов') ? 'badge bg-success' : 'badge bg-info'}>
                                {product.condition}
                              </span>
                            </td>
                          </tr>
                        )}
                        {product.originalVendor && (
                          <tr>
                            <td className="text-muted">Производитель:</td>
                            <td>{product.originalVendor}</td>
                          </tr>
                        )}
                        {product.installationLocation && (
                          <tr>
                            <td className="text-muted">Расположение:</td>
                            <td>{product.installationLocation}</td>
                          </tr>
                        )}
                        {product.address && (
                          <tr>
                            <td className="text-muted">Адрес:</td>
                            <td><i className="bi bi-geo-alt"></i> {product.address}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Описание */}
                  {product.description && (
                    <div className="product-description mb-4">
                      <h5 className="mb-3">Описание</h5>
                      <p>{product.description}</p>
                    </div>
                  )}

                  {/* Кнопки действий */}
                  <div className="action-buttons">
                    <button
                      className={`btn ${isFavorite(product.id) ? 'btn-danger' : 'btn-outline-danger'} me-2`}
                      onClick={handleFavoriteToggle}
                    >
                      <i className={`bi ${isFavorite(product.id) ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                      {isFavorite(product.id) ? ' В избранном' : ' В избранное'}
                    </button>
                    <button
                      className={`btn ${isInCompare(product.id) ? 'btn-info' : 'btn-outline-info'}`}
                      onClick={handleCompareToggle}
                    >
                      <i className="bi bi-arrow-left-right"></i>
                      {isInCompare(product.id) ? ' В сравнении' : ' Сравнить'}
                    </button>
                  </div>

                  {/* Контактная информация */}
                  <div className="contact-section mt-4 p-3 bg-light rounded">
                    <h6 className="mb-3">Связаться с продавцом</h6>
                    <div className="d-grid gap-2">
                      <a href="tel:+79000000000" className="btn btn-success">
                        <i className="bi bi-telephone-fill"></i> Позвонить
                      </a>
                      <a href="https://wa.me/79000000000" target="_blank" rel="noopener noreferrer" className="btn btn-outline-success">
                        <i className="bi bi-whatsapp"></i> WhatsApp
                      </a>
                    </div>
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
