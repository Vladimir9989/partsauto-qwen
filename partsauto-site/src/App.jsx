import { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import toast from 'react-hot-toast'
import { HelmetProvider, Helmet } from 'react-helmet-async'
import { AnimatePresence } from 'framer-motion'
import ProductModal from './components/ProductModal'
import ProductCard from './components/ProductCard'
import FiltersPanel from './components/FiltersPanel'
import Pagination from './components/Pagination'
import SkeletonCard from './components/SkeletonCard'
import CartPanel from './components/CartPanel'
import Header from './components/Header/Header'
import { useFavoritesStore } from './store/useStore'
import { useCartStore } from './store/useCartStore'
import { API_URL, ITEMS_PER_PAGE, SEARCH_DEBOUNCE_DELAY, PRICE_DEBOUNCE_DELAY } from './config'

// Ленивая загрузка страницы избранного
const FavoritesPage = lazy(() => import('./components/FavoritesPage'))

function MainPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  // Состояние
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState('Загрузка...')
  const [brands, setBrands] = useState([])
  const [categories, setCategories] = useState([])
  const [totalResults, setTotalResults] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showCompactFilters, setShowCompactFilters] = useState(false)
  const [cartPanelOpen, setCartPanelOpen] = useState(false)

  const [filters, setFilters] = useState({
    search: '',
    brand: '',
    category: '',
    priceMin: '',
    priceMax: '',
    sortBy: 'default',
  })

  const [priceError, setPriceError] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [debouncedPriceMin, setDebouncedPriceMin] = useState('')
  const [debouncedPriceMax, setDebouncedPriceMax] = useState('')

  const { totalItems } = useCartStore()

  // Refs для фокуса на полях ввода
  const priceMinRef = useRef(null)
  const priceMaxRef = useRef(null)
  const activePriceFieldRef = useRef(null)
  const abortControllerRef = useRef(null)

  // Debounce для поиска
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search)
    }, SEARCH_DEBOUNCE_DELAY)
    return () => clearTimeout(timer)
  }, [filters.search])

  // Debounce для полей цены
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPriceMin(filters.priceMin)
    }, PRICE_DEBOUNCE_DELAY)
    return () => clearTimeout(timer)
  }, [filters.priceMin])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPriceMax(filters.priceMax)
    }, PRICE_DEBOUNCE_DELAY)
    return () => clearTimeout(timer)
  }, [filters.priceMax])

  // Загрузка данных с сервера с использованием AbortController
  useEffect(() => {
    const loadData = async () => {
      // Отмена предыдущего запроса
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()

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

        const response = await fetch(`${API_URL}?${params}`, {
          signal: abortControllerRef.current.signal
        })
        
        if (!response.ok) throw new Error('Ошибка загрузки')

        let data = await response.json()

        // Сортировка на клиенте
        if (filters.sortBy !== 'default') {
          data.products = sortProducts(data.products, filters.sortBy)
        }

        setProducts(data.products)
        setTotalResults(data.total)
        setTotalPages(data.totalPages)
        setLoadingProgress('')
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Запрос отменен')
          return
        }
        console.error('Ошибка:', error)
        setLoadingProgress('Ошибка загрузки')
        toast.error('Ошибка загрузки данных')
      } finally {
        setLoading(false)

        // Восстановление фокуса
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

    // Cleanup: отмена запроса при размонтировании
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [debouncedSearch, debouncedPriceMin, debouncedPriceMax, filters.brand, filters.category, filters.sortBy, currentPage])

  // Загрузка списка брендов и категорий
  useEffect(() => {
    const loadMeta = async () => {
      try {
        const response = await fetch(`${API_URL}?page=1&limit=1`)
        if (!response.ok) throw new Error('Ошибка')
        const data = await response.json()

        if (brands.length === 0 && data.products.length > 0) {
          const allRes = await fetch(`${API_URL}?page=1&limit=1000`)
          const allData = await allRes.json()

          const brandsSet = new Set()
          const categoriesSet = new Set()
          allData.products.forEach(p => {
            if (p.brand) brandsSet.add(p.brand)
            if (p.category) categoriesSet.add(p.category)
          })
          setBrands([...brandsSet].sort())
          setCategories([...categoriesSet].sort())
        }
      } catch (error) {
        console.error('Ошибка загрузки метаданных:', error)
      }
    }

    if (brands.length === 0) loadMeta()
  }, [brands.length])

  // Сброс страницы при изменении фильтров
  useEffect(() => {
    setCurrentPage(1)
  }, [filters.brand, filters.category, debouncedSearch, filters.sortBy])

  // Мемоизированная функция сортировки
  const sortProducts = useCallback((products, sortBy) => {
    const sorted = [...products]
    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => (parseInt(a.price) || 0) - (parseInt(b.price) || 0))
      case 'price-desc':
        return sorted.sort((a, b) => (parseInt(b.price) || 0) - (parseInt(a.price) || 0))
      case 'name-asc':
        return sorted.sort((a, b) => a.title.localeCompare(b.title, 'ru'))
      case 'name-desc':
        return sorted.sort((a, b) => b.title.localeCompare(a.title, 'ru'))
      default:
        return sorted
    }
  }, [])

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
      validatePriceRange(newFilters.priceMin, newFilters.priceMax)
      return newFilters
    })
  }, [validatePriceRange])

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      brand: '',
      category: '',
      priceMin: '',
      priceMax: '',
      sortBy: 'default',
    })
    toast.success('Фильтры сброшены')
  }, [])

  const handleProductClick = useCallback((product) => {
    setSelectedProduct(product)
  }, [])

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleCloseMobileMenu = useCallback(() => {
    setMobileMenuOpen(false)
  }, [])

  const handleToggleCartPanel = useCallback(() => {
    setCartPanelOpen(prev => !prev)
  }, [])

  // Скелетоны для загрузки
  const skeletonCards = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => (
      <div key={`skeleton-${i}`} className="col-md-6 col-xl-4">
        <SkeletonCard />
      </div>
    ))
  }, [])

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
    <>
      <Helmet>
        <title>PartsAuto - Каталог автозапчастей</title>
        <meta name="description" content="Каталог автозапчастей PartsAuto. Найдите нужные запчасти для вашего автомобиля по выгодным ценам." />
        <meta property="og:title" content="PartsAuto - Каталог автозапчастей" />
        <meta property="og:description" content="Каталог автозапчастей PartsAuto" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="container-fluid p-0">
        <Header onCartClick={handleToggleCartPanel} cartItemsCount={totalItems} />

        <div className="container">
          {/* Компактные фильтры для средних экранов */}
          <div className="d-none d-md-block d-lg-none mb-3">
            <div className="compact-filters bg-white rounded shadow-sm p-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0"><i className="bi bi-funnel me-2"></i>Фильтры</h6>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => setShowCompactFilters(!showCompactFilters)}
                >
                  {showCompactFilters ? 'Скрыть' : 'Показать'} фильтры
                </button>
              </div>

              {showCompactFilters && (
                <div className="row g-2 mt-2">
                  <div className="col-md-4">
                    <label className="form-label small mb-1">Поиск</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Название..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small mb-1">Сортировка</label>
                    <select
                      className="form-select form-select-sm"
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    >
                      <option value="default">По умолчанию</option>
                      <option value="price-asc">Цена ↑</option>
                      <option value="price-desc">Цена ↓</option>
                      <option value="name-asc">Название А-Я</option>
                      <option value="name-desc">Название Я-А</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small mb-1">Бренд</label>
                    <select
                      className="form-select form-select-sm"
                      value={filters.brand}
                      onChange={(e) => handleFilterChange('brand', e.target.value)}
                    >
                      <option value="">Все бренды</option>
                      {brands.map((brand, index) => (
                        <option key={`brand-${brand}-${index}`} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label small mb-1">Действия</label>
                    <div className="d-flex gap-1">
                      <button
                        className="btn btn-sm btn-outline-secondary flex-grow-1"
                        onClick={clearFilters}
                        title="Сбросить фильтры"
                      >
                        <i className="bi bi-x-circle"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-primary flex-grow-1"
                        onClick={() => setShowCompactFilters(false)}
                        title="Применить"
                      >
                        <i className="bi bi-check"></i>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="row">
            {/* Filters - боковая панель для больших экранов */}
            <div className={`col-lg-3 mb-4 ${mobileMenuOpen ? '' : 'd-none d-lg-block'}`}>
              <FiltersPanel
                filters={filters}
                brands={brands}
                categories={categories}
                totalResults={totalResults}
                priceError={priceError}
                priceMinRef={priceMinRef}
                priceMaxRef={priceMaxRef}
                onFilterChange={handleFilterChange}
                onPriceChange={handlePriceChange}
                onClearFilters={clearFilters}
                mobileMenuOpen={mobileMenuOpen}
                onCloseMobileMenu={handleCloseMobileMenu}
              />
            </div>

            {/* Products */}
            <div className="col-lg-9">
              {loading ? (
                <div className="row g-3">
                  {skeletonCards}
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
                    {products.map((product, index) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        index={index}
                        onProductClick={handleProductClick}
                      />
                    ))}
                  </div>

                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
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

      <AnimatePresence>
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </AnimatePresence>

      <CartPanel isOpen={cartPanelOpen} onClose={() => setCartPanelOpen(false)} />
    </>
  )
}

function App() {
  return (
    <HelmetProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
              pointerEvents: 'none',
            },
            success: {
              duration: 2000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 3000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />

        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/favorites" element={
            <Suspense fallback={
              <div className="container mt-5 text-center">
                <span className="loading-spinner text-primary"></span>
                <p className="mt-2">Загрузка...</p>
              </div>
            }>
              <Helmet>
                <title>Избранное - PartsAuto</title>
                <meta name="description" content="Избранные автозапчасти" />
              </Helmet>
              <FavoritesPage onProductClick={(product) => {
                // Можно добавить открытие модального окна
              }} />
            </Suspense>
          } />
        </Routes>
      </Router>
    </HelmetProvider>
  )
}

export default App
