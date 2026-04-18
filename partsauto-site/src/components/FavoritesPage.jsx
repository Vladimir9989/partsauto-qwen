import { useFavoritesStore } from '../store/useStore'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const FavoritesPage = ({ onProductClick }) => {
  const { favorites, removeFromFavorites, clearFavorites } = useFavoritesStore()

  const formatPrice = (price) => {
    if (!price) return 'Цена не указана'
    return `${parseInt(price).toLocaleString('ru-RU')} ₽`
  }

  const getImageUrl = (img) => {
    if (!img) return ''
    if (typeof img === 'object') {
      return img['@_url'] || img.url || ''
    }
    return img
  }

  const handleRemove = (productId) => {
    removeFromFavorites(productId)
    toast.success('Удалено из избранного')
  }

  const handleClearAll = () => {
    if (window.confirm('Удалить все товары из избранного?')) {
      clearFavorites()
      toast.success('Избранное очищено')
    }
  }

  if (favorites.length === 0) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <i className="bi bi-heart display-1 text-muted"></i>
          <h3 className="mt-4 text-muted">Избранное пусто</h3>
          <p className="text-muted">Добавьте товары в избранное, чтобы не потерять их</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-heart-fill text-danger"></i> Избранное ({favorites.length})
        </h2>
        <button className="btn btn-outline-danger" onClick={handleClearAll}>
          <i className="bi bi-trash"></i> Очистить всё
        </button>
      </div>

      <div className="row g-3">
        {favorites.map((product, index) => (
          <motion.div
            key={product.id}
            className="col-md-6 col-xl-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="card card-product h-100">
              <div 
                className="product-image-container" 
                onClick={() => onProductClick(product)}
                style={{ cursor: 'pointer' }}
              >
                {product.images && product.images.length > 0 ? (
                  <img
                    src={getImageUrl(product.images[0])}
                    alt={product.title}
                    className="card-img-top product-image"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200"%3E%3Crect fill="%23e9ecef" width="400" height="200"/%3E%3Ctext fill="%236c757d" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3EНет фото%3C/text%3E%3C/svg%3E'
                    }}
                  />
                ) : (
                  <div className="product-image text-muted d-flex align-items-center justify-content-center">
                    <div className="text-center">
                      <i className="bi bi-image display-4"></i>
                      <div className="mt-2">Нет фото</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="card-body d-flex flex-column">
                <h6 className="card-title">{product.title}</h6>

                <div className="mb-2">
                  {product.price ? (
                    <span className="price-badge text-primary">{formatPrice(product.price)}</span>
                  ) : (
                    <span className="badge bg-secondary">Цена по запросу</span>
                  )}
                </div>

                <div className="small mb-2">
                  {product.brand && (
                    <div><i className="bi bi-tag"></i> {product.brand}</div>
                  )}
                  {(product.carMake || product.carModel) && (
                    <div><i className="bi bi-car-front"></i> {product.carMake} {product.carModel}</div>
                  )}
                </div>

                <div className="mt-auto">
                  <button
                    className="btn btn-sm btn-outline-danger w-100"
                    onClick={() => handleRemove(product.id)}
                  >
                    <i className="bi bi-heart-fill"></i> Удалить из избранного
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default FavoritesPage
