import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import ProductModal from '../components/ProductModal'
import ProductCard from '../components/ProductCard'
import FiltersPanel from '../components/FiltersPanel'
import Pagination from '../components/Pagination'
import SkeletonCard from '../components/SkeletonCard'
import { API_URL, ITEMS_PER_PAGE, SEARCH_DEBOUNCE_DELAY, PRICE_DEBOUNCE_DELAY } from '../config'
import styles from './CatalogPage.module.css'

function CatalogPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  // Состояние
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState('Загрузка...')
  const [brands, setBrands] = useState([])
  const [categories, setCategories] = useState([])
  const [totalResults, setTotalResults] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showCompactFilters, setShowCompactFilters] = useState(false)

  const [filters, setFilters] = useState({
    search: '',
    brand: '',
    category: '',
    carModel: '',
    generation: '',
  })

  const [models, setModels] = useState([])
  const [generations, setGenerations] = useState([])
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const abortControllerRef = useRef(null)

  // Debounce для поиска
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search)
    }, SEARCH_DEBOUNCE_DELAY)
    return () => clearTimeout(timer)
  }, [filters.search])

  // Загрузка данных с сервера с использованием AbortController
  useEffect(() => {
    const loadData = async () => {
      // Отмена предыдущего запроса
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()

      setLoading(true)
      setLoadingProgress('Загрузка...')

      try {
        const params = new URLSearchParams()
        if (debouncedSearch) params.set('search', debouncedSearch)
        if (filters.brand) params.set('brand', filters.brand)
        if (filters.category) params.set('category', filters.category)
        if (filters.carModel) params.set('carModel', filters.carModel)
        if (filters.generation) params.set('generation', filters.generation)
        params.set('page', currentPage)
        params.set('limit', ITEMS_PER_PAGE)

        const response = await fetch(`${API_URL}?${params}`, {
          signal: abortControllerRef.current.signal
        })
        
        if (!response.ok) throw new Error('Ошибка загрузки')

        let data = await response.json()

        setProducts(data.products)
        setTotalResults(data.total)
        setTotalPages(data.totalPages)
        setLoadingProgress('')
        setInitialLoad(false)
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Запрос отменен')
          return
        }
        console.error('Ошибка:', error)
        setLoadingProgress('Ошибка загрузки')
        toast.error('Ошибка загрузки данных')
        setInitialLoad(false)
      } finally {
        setLoading(false)
      }
    }

    loadData()

    // Cleanup: отмена запроса при размонтировании
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [debouncedSearch, filters.brand, filters.category, filters.carModel, filters.generation, currentPage])

  // Загрузка списка брендов, категорий, моделей и поколений
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

  // Загрузка моделей при выборе бренда
  useEffect(() => {
    const loadModels = async () => {
      if (!filters.brand) {
        setModels([])
        return
      }

      try {
        const res = await fetch(`${API_URL}?brand=${encodeURIComponent(filters.brand)}&limit=1000`)
        const data = await res.json()
        const uniqueModels = [...new Set(data.products.map(p => p.carModel).filter(Boolean))]
        setModels(uniqueModels.sort())
      } catch (error) {
        console.error('Ошибка загрузки моделей:', error)
      }
    }

    loadModels()
  }, [filters.brand])

  // Загрузка поколений при выборе модели
  useEffect(() => {
    const loadGenerations = async () => {
      if (!filters.brand || !filters.carModel) {
        setGenerations([])
        return
      }

      try {
        const res = await fetch(`${API_URL}?brand=${encodeURIComponent(filters.brand)}&carModel=${encodeURIComponent(filters.carModel)}&limit=1000`)
        const data = await res.json()
        const uniqueGenerations = [...new Set(data.products.map(p => p.generation).filter(Boolean))]
        setGenerations(uniqueGenerations.sort())
      } catch (error) {
        console.error('Ошибка загрузки поколений:', error)
      }
    }

    loadGenerations()
  }, [filters.brand, filters.carModel])

  // Инициализация фильтров из URL при загрузке страницы
  useEffect(() => {
    const brand = searchParams.get('brand')
    const carModel = searchParams.get('carModel')
    const generation = searchParams.get('generation')

    if (brand || carModel || generation) {
      setFilters(prev => ({
        ...prev,
        brand: brand || '',
        carModel: carModel || '',
        generation: generation || ''
      }))
    }
  }, [])

  // Сброс страницы при изменении фильтров
  useEffect(() => {
    setCurrentPage(1)
  }, [filters.brand, filters.category, filters.carModel, filters.generation, debouncedSearch])

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      brand: '',
      category: '',
      carModel: '',
      generation: '',
    })
    setSearchParams({})
    toast.success('Фильтры сброшены')
  }, [setSearchParams])

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

  // Скелетоны для загрузки
  const skeletonCards = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => (
      <div key={`skeleton-${i}`} className="col-md-6 col-xl-4">
        <SkeletonCard />
      </div>
    ))
  }, [])

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
                  <div className="col-md-3">
                    <label className="form-label small mb-1">Поиск</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Название..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label small mb-1">Бренд</label>
                    <select
                      className="form-select form-select-sm"
                      value={filters.brand}
                      onChange={(e) => {
                        handleFilterChange('brand', e.target.value)
                        handleFilterChange('carModel', '')
                        handleFilterChange('generation', '')
                      }}
                    >
                      <option value="">Все бренды</option>
                      {brands.map((brand, index) => (
                        <option key={`brand-${brand}-${index}`} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label small mb-1">Модель</label>
                    <select
                      className="form-select form-select-sm"
                      value={filters.carModel}
                      onChange={(e) => {
                        handleFilterChange('carModel', e.target.value)
                        handleFilterChange('generation', '')
                      }}
                      disabled={!filters.brand}
                    >
                      <option value="">Все модели</option>
                      {models.map((model, index) => (
                        <option key={`model-${model}-${index}`} value={model}>{model}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label small mb-1">Поколение</label>
                    <select
                      className="form-select form-select-sm"
                      value={filters.generation}
                      onChange={(e) => handleFilterChange('generation', e.target.value)}
                      disabled={!filters.carModel}
                    >
                      <option value="">Все поколения</option>
                      {generations.map((gen, index) => (
                        <option key={`gen-${gen}-${index}`} value={gen}>{gen}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3">
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
                models={models}
                generations={generations}
                totalResults={totalResults}
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
                mobileMenuOpen={mobileMenuOpen}
                onCloseMobileMenu={handleCloseMobileMenu}
              />
            </div>

            {/* Products */}
            <div className="col-lg-9">
              {loading ? (
                <div className={styles.loadingContainer}>
                  <div className={styles.spinner}></div>
                  <p className={styles.loadingText}>Каталог загружается</p>
                </div>
              ) : products.length === 0 && (filters.search || filters.brand || filters.category || filters.carModel || filters.generation) ? (
                <div className="text-center py-5">
                  <i className="bi bi-search display-1 text-muted"></i>
                  <h4 className="mt-3 text-muted">Ничего не найдено</h4>
                  <p className="text-muted">Попробуйте изменить параметры поиска</p>
                </div>
              ) : products.length === 0 ? (
                <div className={styles.loadingContainer}>
                  <div className={styles.spinner}></div>
                  <p className={styles.loadingText}>Каталог загружается</p>
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
    </>
  )
}

export default CatalogPage
