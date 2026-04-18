import { useCompareStore } from '../store/useStore'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const ComparePage = ({ onProductClick }) => {
  const { compareList, removeFromCompare, clearCompare } = useCompareStore()

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
    removeFromCompare(productId)
    toast.success('Удалено из сравнения')
  }

  const handleClearAll = () => {
    if (window.confirm('Очистить список сравнения?')) {
      clearCompare()
      toast.success('Список сравнения очищен')
    }
  }

  if (compareList.length === 0) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <i className="bi bi-arrow-left-right display-1 text-muted"></i>
          <h3 className="mt-4 text-muted">Нет товаров для сравнения</h3>
          <p className="text-muted">Добавьте товары для сравнения их характеристик</p>
        </div>
      </div>
    )
  }

  // Собираем все уникальные характеристики
  const allCharacteristics = new Set()
  compareList.forEach(product => {
    if (product.brand) allCharacteristics.add('brand')
    if (product.category) allCharacteristics.add('category')
    if (product.carMake || product.carModel) allCharacteristics.add('car')
    if (product.generation) allCharacteristics.add('generation')
    if (product.condition) allCharacteristics.add('condition')
    if (product.originalVendor) allCharacteristics.add('originalVendor')
    if (product.installationLocation) allCharacteristics.add('installationLocation')
    if (product.address) allCharacteristics.add('address')
  })

  const characteristicLabels = {
    brand: 'Бренд',
    category: 'Категория',
    car: 'Автомобиль',
    generation: 'Поколение',
    condition: 'Состояние',
    originalVendor: 'Производитель',
    installationLocation: 'Расположение',
    address: 'Адрес'
  }

  const getCharacteristicValue = (product, char) => {
    switch (char) {
      case 'car':
        return `${product.carMake || ''} ${product.carModel || ''}`.trim() || '—'
      case 'brand':
        return product.brand || '—'
      case 'category':
        return product.category || '—'
      case 'generation':
        return product.generation || '—'
      case 'condition':
        return product.condition || '—'
      case 'originalVendor':
        return product.originalVendor || '—'
      case 'installationLocation':
        return product.installationLocation || '—'
      case 'address':
        return product.address || '—'
      default:
        return '—'
    }
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-arrow-left-right text-info"></i> Сравнение товаров ({compareList.length})
        </h2>
        <button className="btn btn-outline-danger" onClick={handleClearAll}>
          <i className="bi bi-trash"></i> Очистить всё
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered compare-table">
          <thead>
            <tr>
              <th style={{ width: '200px' }}>Характеристика</th>
              {compareList.map((product) => (
                <th key={product.id} className="text-center">
                  <div className="compare-product-header">
                    <div className="compare-image mb-2">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={getImageUrl(product.images[0])}
                          alt={product.title}
                          className="img-fluid"
                          loading="lazy"
                          style={{ maxHeight: '150px', objectFit: 'cover', cursor: 'pointer' }}
                          onClick={() => onProductClick(product)}
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Crect fill="%23e9ecef" width="150" height="150"/%3E%3C/svg%3E'
                          }}
                        />
                      ) : (
                        <div className="text-muted" style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="bi bi-image display-4"></i>
                        </div>
                      )}
                    </div>
                    <h6 className="mb-2">{product.title}</h6>
                    <div className="price-badge text-primary mb-2">{formatPrice(product.price)}</div>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleRemove(product.id)}
                    >
                      <i className="bi bi-x"></i> Удалить
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="fw-bold">Цена</td>
              {compareList.map((product) => (
                <td key={product.id} className="text-center">
                  <span className="text-primary fw-bold">{formatPrice(product.price)}</span>
                </td>
              ))}
            </tr>
            {Array.from(allCharacteristics).map((char) => (
              <tr key={char}>
                <td className="fw-bold">{characteristicLabels[char]}</td>
                {compareList.map((product) => (
                  <td key={product.id} className="text-center">
                    {getCharacteristicValue(product, char)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ComparePage
