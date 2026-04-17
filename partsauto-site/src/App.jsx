import { useState, useEffect, useRef, useCallback } from 'react'

const API_URL = '/api/products'
const ITEMS_PER_PAGE = 20

function App() {
  // Состояние
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState('Загрузка...')
  const [brands, setBrands] = useState([])
  const [categories, setCategories] = useState([])
  const [totalResults, setTotalResults] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    search: '',
    brand: '',
    category: '',
    priceMin: '',
    priceMax: '',
  })
  const [priceError, setPriceError] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [debouncedPriceMin, setDebouncedPriceMin] = useState('')
  const [debouncedPriceMax, setDebouncedPriceMax] = useState('')

  // Ref для сохранения фокуса на полях ввода
  const priceMinRef = useRef(null)
  const priceMaxRef = useRef(null)
  const activePriceFieldRef = useRef(null)

  // Debounce для поиска
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search)
    }, 300)
    return () => clearTimeout(timer)
  }, [filters.search])

  // Debounce для полей цены
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPriceMin(filters.priceMin)
    }, 500)
    return () => clearTimeout(timer)
  }, [filters.priceMin])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPriceMax(filters.priceMax)
    }, 500)
    return () => clearTimeout(timer)
  }, [filters.priceMax])

  // Загрузка данных с сервера (с фильтрацией на сервере)
  useEffect(() => {
    const loadData = async () => {
      // Сохраняем активный элемент перед загрузкой
      const activeElement = document.activeElement
      if (activeElement === priceMinRef.current) {
        activePriceFieldRef.current = 'priceMin'
      } else if (activeElement === priceMaxRef.current) {
        activePriceFieldRef.current = 'priceMax'
      }
      
      setLoading(true)
      setLoadingProgress('Загрузка...')
      
      try {
        const params = new URLSearchParams()
        if (debouncedSearch) params.set('search', debouncedSearch)
        if (filters.brand) params.set('brand', filters.brand)
        if (filters.category) params.set('category', filters.category)
        if (debouncedPriceMin) params.set('priceMin', debouncedPriceMin)
        if (debouncedPriceMax) params.set('priceMax', debouncedPriceMax)
        params.set('page', currentPage)
        params.set('limit', ITEMS_PER_PAGE)

        const response = await fetch(`${API_URL}?${params}`)
        if (!response.ok) throw new Error('Ошибка загрузки')
        
        const data = await response.json()
        setProducts(data.products)
        setTotalResults(data.total)
        setTotalPages(data.totalPages)
        setLoadingProgress('')
      } catch (error) {
        console.error('Ошибка:', error)
        setLoadingProgress('Ошибка загрузки')
      } finally {
        setLoading(false)
        
        // Восстанавливаем фокус после загрузки
        setTimeout(() => {
          if (activePriceFieldRef.current === 'priceMin' && priceMinRef.current) {
            priceMinRef.current.focus()
          } else if (activePriceFieldRef.current === 'priceMax' && priceMaxRef.current) {
            priceMaxRef.current.focus()
          }
          activePriceFieldRef.current = null
        }, 0)
      }
    }

    loadData()
  }, [debouncedSearch, debouncedPriceMin, debouncedPriceMax, filters.brand, filters.category, currentPage])

  // Загрузка списка брендов и категорий (при первой загрузке)
  useEffect(() => {
    const loadMeta = async () => {
      try {
        const response = await fetch(`${API_URL}?page=1&limit=1`)
        if (!response.ok) throw new Error('Ошибка')
        const data = await response.json()
        
        // Если нужно загрузить все бренды, делаем отдельный запрос
        // Пока берём из текущего ответа
        if (brands.length === 0 && data.products.length > 0) {
          // Загрузим все для получения полного списка
          const allRes = await fetch(`${API_URL}?page=1&limit=1000`)
          const allData = await allRes.json()
          
          const brandsSet = new Set()
          const categoriesSet = new Set()
          allData.products.forEach(p => {
            if (p.brand) brandsSet.add(p.brand)
            if (p.category) categoriesSet.add(p.category)
          })
          setBrands(Array.from(brandsSet).sort())
          setCategories(Array.from(categoriesSet).sort())
        }
      } catch (error) {
        console.error('Ошибка загрузки метаданных:', error)
      }
    }

    if (brands.length === 0) loadMeta()
  }, [])

  // Сброс страницы при изменении фильтров (кроме цен)
  useEffect(() => {
    setCurrentPage(1)
  }, [filters.brand, filters.category, filters.search])

  const validatePriceRange = useCallback((min, max) => {
    const minVal = min ? parseInt(min) : null
    const maxVal = max ? parseInt(max) : null
    
    if (minVal !== null && maxVal !== null && minVal > maxVal) {
      setPriceError('Цена "до" должна быть больше или равна цене "от"')
      return false
    }
    
    setPriceError('')
    return true
  }, [])

  const handlePriceChange = useCallback((key, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value }
      
      // Валидация диапазона цен
      validatePriceRange(newFilters.priceMin, newFilters.priceMax)
      
      return newFilters
    })
  }, [validatePriceRange])

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const clearFilters = () => {
    setFilters({
      search: '',
      brand: '',
      category: '',
      priceMin: '',
      priceMax: '',
    })
  }

  const formatPrice = (price) => {
    if (!price) return 'Цена не указана'
    return `${parseInt(price).toLocaleString('ru-RU')} ₽`
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null

    const pages = []
    const maxVisible = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    let endPage = Math.min(totalPages, startPage + maxVisible - 1)

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return (
      <nav className="mt-4">
        <ul className="pagination justify-content-center flex-wrap">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
              <i className="bi bi-chevron-left"></i> Назад
            </button>
          </li>

          {startPage > 1 && (
            <>
              <li className="page-item">
                <button className="page-link" onClick={() => setCurrentPage(1)}>1</button>
              </li>
              {startPage > 2 && <li className="page-item disabled"><span className="page-link">...</span></li>}
            </>
          )}

          {pages.map(page => (
            <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
              <button className="page-link" onClick={() => setCurrentPage(page)}>{page}</button>
            </li>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <li className="page-item disabled"><span className="page-link">...</span></li>}
              <li className="page-item">
                <button className="page-link" onClick={() => setCurrentPage(totalPages)}>{totalPages}</button>
              </li>
            </>
          )}

          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
              Вперёд <i className="bi bi-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    )
  }

  // Функция для получения URL изображения
  const getImageUrl = (img) => {
    if (typeof img === 'object') {
      return img['@_url'] || img.url || '';
    }
    return img || '';
  };

  // Компонент слайдера изображений для товара
  const ProductImageSlider = ({ images, title }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    
    if (!images || images.length === 0) {
      return (
        <div className="product-image text-muted d-flex align-items-center justify-content-center">
          <div className="text-center">
            <i className="bi bi-image display-4"></i>
            <div className="mt-2">Нет фото</div>
          </div>
        </div>
      );
    }
    
    const goToPrevious = () => {
      setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? images.length - 1 : prevIndex - 1
      );
    };
    
    const goToNext = () => {
      setCurrentIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    };
    
    const goToSlide = (index) => {
      setCurrentIndex(index);
    };
    
    const currentImage = images[currentIndex];
    const imageUrl = getImageUrl(currentImage);
    
    return (
      <div className="product-image-slider position-relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${title} - фото ${currentIndex + 1}`}
            className="card-img-top product-image"
            onError={(e) => {
              e.target.style.display = 'none';
              // Показать заглушку при ошибке загрузки
              const fallback = e.target.parentElement.querySelector('.image-fallback');
              if (fallback) fallback.style.display = 'flex';
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
        
        {/* Заглушка для ошибки загрузки */}
        <div className="image-fallback product-image text-muted d-none align-items-center justify-content-center">
          <div className="text-center">
            <i className="bi bi-image display-4"></i>
            <div className="mt-2">Ошибка загрузки</div>
          </div>
        </div>
        
        {/* Навигация (только если больше 1 фото) */}
        {images.length > 1 && (
          <>
            <button
              className="slider-nav slider-prev btn btn-sm btn-light rounded-circle"
              onClick={goToPrevious}
              aria-label="Предыдущее фото"
            >
              <i className="bi bi-chevron-left"></i>
            </button>
            <button
              className="slider-nav slider-next btn btn-sm btn-light rounded-circle"
              onClick={goToNext}
              aria-label="Следующее фото"
            >
              <i className="bi bi-chevron-right"></i>
            </button>
            
            {/* Индикаторы */}
            <div className="slider-indicators">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`indicator ${index === currentIndex ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Перейти к фото ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  if (loading && products.length === 0) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="mb-3">
              <span className="loading-spinner text-primary"></span>
            </div>
            <h4 className="text-primary">{loadingProgress}</h4>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid p-0">
      <header className="bg-primary text-white py-4 mb-4">
        <div className="container">
          <h1 className="mb-2"><i className="bi bi-gear-wide-connected"></i> PartsAuto</h1>
          <p className="mb-0">Каталог автозапчастей</p>
        </div>
      </header>

      <div className="container">
        <div className="row">
          {/* Filters */}
          <div className="col-lg-3 mb-4">
            <div className="filter-section p-3">
              <h5 className="mb-3"><i className="bi bi-funnel"></i> Фильтры</h5>

              <div className="mb-3">
                <label className="form-label">Поиск</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Название или модель..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Бренд</label>
                <select
                  className="form-select"
                  value={filters.brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                >
                  <option value="">Все бренды</option>
                  {brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Категория</label>
                <select
                  className="form-select"
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <option value="">Все категории</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Цена от</label>
                <input
                  ref={priceMinRef}
                  type="number"
                  className="form-control"
                  placeholder="Мин."
                  value={filters.priceMin}
                  onChange={(e) => handlePriceChange('priceMin', e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Цена до</label>
                <input
                  ref={priceMaxRef}
                  type="number"
                  className="form-control"
                  placeholder="Макс."
                  value={filters.priceMax}
                  onChange={(e) => handlePriceChange('priceMax', e.target.value)}
                />
              </div>

              {priceError && (
                <div className="alert alert-danger" role="alert">
                  <i className="bi bi-exclamation-triangle"></i> {priceError}
                </div>
              )}

              <button
                className="btn btn-outline-secondary w-100"
                onClick={clearFilters}
              >
                <i className="bi bi-x-circle"></i> Сбросить фильтры
              </button>

              <div className="mt-3 text-muted small">
                Найдено: {totalResults}
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="col-lg-9">
            {loading ? (
              <div className="text-center py-5">
                <span className="loading-spinner text-primary"></span>
                <p className="mt-2 text-muted">Загрузка...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-search display-1 text-muted"></i>
                <h4 className="mt-3 text-muted">Ничего не найдено</h4>
                <p className="text-muted">Попробуйте изменить параметры поиска</p>
              </div>
            ) : (
              <>
                <div className="row g-3">
                  {products.map(product => (
                    <div key={product.id} className="col-md-6 col-xl-4">
                      <div className="card card-product">
                        <ProductImageSlider images={product.images} title={product.title} />

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
                            {product.generation && (
                              <div><i className="bi bi-info-circle"></i> {product.generation}</div>
                            )}
                            {product.condition && (
                              <div>
                                <i className="bi bi-box"></i>{' '}
                                <span className={product.condition.includes('Нов') ? 'text-success' : 'text-info'}>
                                  {product.condition}
                                </span>
                              </div>
                            )}
                            {product.originalVendor && (
                              <div><i className="bi bi-patch-check"></i> {product.originalVendor}</div>
                            )}
                            {product.installationLocation && (
                              <div><i className="bi bi-geo"></i> {product.installationLocation}</div>
                            )}
                          </div>

                          {product.category && (
                            <span className="badge bg-light text-dark category-badge mb-2">
                              {product.category}
                            </span>
                          )}

                          {product.address && (
                            <div className="small text-muted mt-auto">
                              <i className="bi bi-geo-alt"></i> {product.address}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {renderPagination()}
              </>
            )}
          </div>
        </div>
      </div>

      <footer className="bg-dark text-white text-center py-3 mt-5">
        <div className="container">
          <small>© 2026 PartsAuto - Каталог автозапчастей</small>
        </div>
      </footer>
    </div>
  )
}

export default App
