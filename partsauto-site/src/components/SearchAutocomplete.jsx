import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SearchAutocomplete = ({ value, onChange, products, onSelectProduct }) => {
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [recentSearches, setRecentSearches] = useState([])
  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)

  // Загрузка истории поиска из localStorage
  useEffect(() => {
    const saved = localStorage.getItem('partsauto-recent-searches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // Генерация подсказок на основе введенного текста
  useEffect(() => {
    if (value.length >= 2) {
      // Поиск совпадений в названиях товаров
      const matches = products
        .filter(p => 
          p.title.toLowerCase().includes(value.toLowerCase()) ||
          (p.brand && p.brand.toLowerCase().includes(value.toLowerCase())) ||
          (p.category && p.category.toLowerCase().includes(value.toLowerCase()))
        )
        .slice(0, 8)
        .map(p => ({
          type: 'product',
          text: p.title,
          brand: p.brand,
          category: p.category,
          product: p
        }))

      // Добавляем уникальные бренды и категории
      const brands = new Set()
      const categories = new Set()
      
      products.forEach(p => {
        if (p.brand && p.brand.toLowerCase().includes(value.toLowerCase())) {
          brands.add(p.brand)
        }
        if (p.category && p.category.toLowerCase().includes(value.toLowerCase())) {
          categories.add(p.category)
        }
      })

      const brandSuggestions = Array.from(brands).slice(0, 3).map(b => ({
        type: 'brand',
        text: b
      }))

      const categorySuggestions = Array.from(categories).slice(0, 3).map(c => ({
        type: 'category',
        text: c
      }))

      setSuggestions([...brandSuggestions, ...categorySuggestions, ...matches])
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [value, products])

  // Обработка клика вне компонента
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          handleSelectSuggestion(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  const handleSelectSuggestion = (suggestion) => {
    if (suggestion.type === 'product') {
      onChange(suggestion.text)
      if (onSelectProduct) {
        onSelectProduct(suggestion.product)
      }
    } else {
      onChange(suggestion.text)
    }
    
    // Сохранение в историю поиска
    saveToRecentSearches(suggestion.text)
    setShowSuggestions(false)
    setSelectedIndex(-1)
  }

  const saveToRecentSearches = (searchText) => {
    const updated = [searchText, ...recentSearches.filter(s => s !== searchText)].slice(0, 10)
    setRecentSearches(updated)
    localStorage.setItem('partsauto-recent-searches', JSON.stringify(updated))
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('partsauto-recent-searches')
  }

  const handleFocus = () => {
    if (value.length >= 2) {
      setShowSuggestions(true)
    } else if (recentSearches.length > 0) {
      setShowSuggestions(true)
    }
  }

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'brand':
        return 'bi-tag'
      case 'category':
        return 'bi-folder'
      case 'product':
        return 'bi-box-seam'
      default:
        return 'bi-search'
    }
  }

  return (
    <div className="search-autocomplete-container">
      <div className="position-relative">
        <input
          ref={inputRef}
          type="text"
          className="form-control"
          placeholder="Поиск по названию, бренду, категории..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        {value && (
          <button
            className="btn-clear-search"
            onClick={() => {
              onChange('')
              setShowSuggestions(false)
            }}
            aria-label="Очистить поиск"
          >
            <i className="bi bi-x-circle-fill"></i>
          </button>
        )}
      </div>

      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            ref={suggestionsRef}
            className="autocomplete-suggestions"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* История поиска */}
            {value.length < 2 && recentSearches.length > 0 && (
              <>
                <div className="suggestions-header">
                  <span className="text-muted small">
                    <i className="bi bi-clock-history me-1"></i>
                    Недавние поиски
                  </span>
                  <button
                    className="btn btn-link btn-sm p-0 text-muted"
                    onClick={clearRecentSearches}
                  >
                    Очистить
                  </button>
                </div>
                {recentSearches.map((search, index) => (
                  <div
                    key={index}
                    className="suggestion-item"
                    onClick={() => {
                      onChange(search)
                      setShowSuggestions(false)
                    }}
                  >
                    <i className="bi bi-clock-history text-muted me-2"></i>
                    <span>{search}</span>
                  </div>
                ))}
              </>
            )}

            {/* Подсказки */}
            {suggestions.length > 0 && value.length >= 2 && (
              <>
                <div className="suggestions-header">
                  <span className="text-muted small">
                    <i className="bi bi-lightbulb me-1"></i>
                    Подсказки
                  </span>
                </div>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <i className={`bi ${getSuggestionIcon(suggestion.type)} me-2`}></i>
                    <div className="suggestion-content">
                      <div className="suggestion-text">
                        {highlightMatch(suggestion.text, value)}
                      </div>
                      {suggestion.type === 'product' && (
                        <div className="suggestion-meta">
                          {suggestion.brand && (
                            <span className="badge bg-light text-dark me-1">
                              {suggestion.brand}
                            </span>
                          )}
                          {suggestion.category && (
                            <span className="badge bg-light text-dark">
                              {suggestion.category}
                            </span>
                          )}
                        </div>
                      )}
                      {suggestion.type === 'brand' && (
                        <span className="suggestion-type-label">Бренд</span>
                      )}
                      {suggestion.type === 'category' && (
                        <span className="suggestion-type-label">Категория</span>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}

            {suggestions.length === 0 && value.length >= 2 && (
              <div className="suggestion-item text-muted">
                <i className="bi bi-search me-2"></i>
                Ничего не найдено
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Функция для подсветки совпадений
const highlightMatch = (text, query) => {
  if (!query) return text
  
  const parts = text.split(new RegExp(`(${query})`, 'gi'))
  return (
    <span>
      {parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <strong key={index} className="text-primary">{part}</strong>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  )
}

export default SearchAutocomplete
