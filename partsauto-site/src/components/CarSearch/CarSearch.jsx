import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './CarSearch.module.css'

const CarSearch = () => {
  const navigate = useNavigate()
  const [brands, setBrands] = useState([])
  const [models, setModels] = useState([])
  const [generations, setGenerations] = useState([])
  const [loading, setLoading] = useState(false)
  const [brandsLoading, setBrandsLoading] = useState(true)
  
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedGeneration, setSelectedGeneration] = useState('')
  
  const [currentView, setCurrentView] = useState('brands') // 'brands', 'models', 'generations'

  // Загрузка списка брендов из API каталога
  useEffect(() => {
    const loadBrands = async () => {
      setBrandsLoading(true)
      try {
        const res = await fetch('/api/products?page=1&limit=1000')
        const data = await res.json()
        const uniqueBrands = [...new Set(data.products.map(p => p.brand).filter(Boolean))]
        const sorted = uniqueBrands.sort()
        // Переместить "Разное" в конец
        const miscIndex = sorted.indexOf('Разное')
        if (miscIndex > -1) {
          sorted.splice(miscIndex, 1)
          sorted.push('Разное')
        }
        setBrands(sorted)
      } catch (error) {
        console.error('Ошибка загрузки брендов:', error)
      } finally {
        setBrandsLoading(false)
      }
    }
    loadBrands()
  }, [])

  // Загрузка моделей при выборе бренда
  const handleBrandClick = async (brand) => {
    // Если выбрано "Разное", сразу переходим в каталог
    if (brand === 'Разное') {
      const params = new URLSearchParams()
      params.set('brand', brand)
      navigate(`/catalog?${params.toString()}`)
      return
    }

    setSelectedBrand(brand)
    setSelectedModel('')
    setSelectedGeneration('')
    setCurrentView('models')
    setLoading(true)
    
    try {
      const res = await fetch(`/api/products?brand=${encodeURIComponent(brand)}&limit=1000`)
      const data = await res.json()
      const uniqueModels = [...new Set(data.products.map(p => p.carModel).filter(Boolean))]
      setModels(uniqueModels.sort())
    } catch (error) {
      console.error('Ошибка загрузки моделей:', error)
    } finally {
      setLoading(false)
    }
  }

  // Загрузка поколений при выборе модели
  const handleModelClick = async (model) => {
    setSelectedModel(model)
    setSelectedGeneration('')
    setLoading(true)
    
    try {
      const res = await fetch(`/api/products?brand=${encodeURIComponent(selectedBrand)}&carModel=${encodeURIComponent(model)}&limit=1000`)
      const data = await res.json()
      const uniqueGenerations = [...new Set(data.products.map(p => p.generation).filter(Boolean))]
      
      // Если нет поколений, сразу переходим в каталог
      if (uniqueGenerations.length === 0) {
        const params = new URLSearchParams()
        params.set('brand', selectedBrand)
        params.set('carModel', model)
        navigate(`/catalog?${params.toString()}`)
        setLoading(false)
        return
      }
      
      // Если есть поколения, показываем их для выбора
      setGenerations(uniqueGenerations.sort())
      setCurrentView('generations')
    } catch (error) {
      console.error('Ошибка загрузки поколений:', error)
    } finally {
      setLoading(false)
    }
  }

  // Выбор поколения и переход в каталог
  const handleGenerationClick = (generation) => {
    setSelectedGeneration(generation)
    
    // Переход на страницу каталога с параметрами
    const params = new URLSearchParams()
    if (selectedBrand) params.set('brand', selectedBrand)
    if (selectedModel) params.set('carModel', selectedModel)
    if (generation) params.set('generation', generation)
    
    navigate(`/catalog?${params.toString()}`)
  }

  // Поиск с выбранными фильтрами
  const handleSearch = () => {
    const params = new URLSearchParams()
    if (selectedBrand) params.set('brand', selectedBrand)
    if (selectedModel) params.set('carModel', selectedModel)
    if (selectedGeneration) params.set('generation', selectedGeneration)
    
    navigate(`/catalog?${params.toString()}`)
  }

  // Сброс к выбору марок
  const resetToBrands = () => {
    setSelectedBrand('')
    setSelectedModel('')
    setSelectedGeneration('')
    setCurrentView('brands')
  }

  // Возврат к выбору моделей
  const backToModels = () => {
    setSelectedModel('')
    setSelectedGeneration('')
    setCurrentView('models')
  }

  return (
    <section className={styles.carSearch}>
      <div className={styles.container}>
        <h2 className={styles.title}>Поиск автозапчастей</h2>
        
        <div className={styles.searchPanel}>
          <div className={styles.selectsRow}>
            <div className={styles.selectWrapper}>
              <div
                className={`${styles.select} ${selectedBrand ? styles.active : ''}`}
                onClick={resetToBrands}
              >
                {selectedBrand || 'Выберите марку'}
              </div>
            </div>

            <div className={styles.selectWrapper}>
              <div
                className={`${styles.select} ${selectedModel ? styles.active : ''} ${!selectedBrand ? styles.disabled : ''}`}
                onClick={() => {
                  if (selectedBrand && currentView !== 'models') {
                    backToModels()
                  }
                }}
              >
                {selectedModel || 'Выберите модель'}
              </div>
            </div>

            <div className={styles.selectWrapper}>
              <div
                className={`${styles.select} ${selectedGeneration ? styles.active : ''} ${!selectedModel ? styles.disabled : ''}`}
              >
                {selectedGeneration || 'Выберите поколение'}
              </div>
            </div>

            <button
              className={styles.searchBtn}
              onClick={handleSearch}
            >
              Найти запчасти
            </button>
          </div>

          <div className={styles.brandsGrid}>
            {(loading || (brandsLoading && currentView === 'brands')) ? (
              <div className={styles.spinnerContainer}>
                <div className={styles.spinner}></div>
              </div>
            ) : currentView === 'brands' ? (
              brands.map(brand => (
                <a
                  key={brand}
                  href="#"
                  className={styles.brandLink}
                  onClick={(e) => {
                    e.preventDefault()
                    handleBrandClick(brand)
                  }}
                >
                  {brand}
                </a>
              ))
            ) : currentView === 'models' ? (
              models.map(model => (
                <a
                  key={model}
                  href="#"
                  className={styles.brandLink}
                  onClick={(e) => {
                    e.preventDefault()
                    handleModelClick(model)
                  }}
                >
                  {model}
                </a>
              ))
            ) : currentView === 'generations' ? (
              generations.map(gen => (
                <a
                  key={gen}
                  href="#"
                  className={styles.brandLink}
                  onClick={(e) => {
                    e.preventDefault()
                    handleGenerationClick(gen)
                  }}
                >
                  {gen}
                </a>
              ))
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}

export default CarSearch
