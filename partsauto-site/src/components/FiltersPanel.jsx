import React, { useCallback } from 'react'

// Компонент панели фильтров
const FiltersPanel = ({
  filters,
  brands,
  categories,
  models,
  generations,
  totalResults,
  onFilterChange,
  onClearFilters,
  mobileMenuOpen,
  onCloseMobileMenu
}) => {
  
  const handleFilterChange = useCallback((key, value) => {
    onFilterChange(key, value)
  }, [onFilterChange])

  const handleBrandChange = useCallback((value) => {
    onFilterChange('brand', value)
    onFilterChange('carModel', '')
    onFilterChange('generation', '')
  }, [onFilterChange])

  const handleModelChange = useCallback((value) => {
    onFilterChange('carModel', value)
    onFilterChange('generation', '')
  }, [onFilterChange])

  return (
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
          onChange={(e) => handleBrandChange(e.target.value)}
        >
          <option value="">Все бренды</option>
          {brands.map((brand, index) => (
            <option key={`brand-${brand}-${index}`} value={brand}>{brand}</option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Модель</label>
        <select
          className="form-select"
          value={filters.carModel}
          onChange={(e) => handleModelChange(e.target.value)}
          disabled={!filters.brand}
        >
          <option value="">Все модели</option>
          {models.map((model, index) => (
            <option key={`model-${model}-${index}`} value={model}>{model}</option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Поколение</label>
        <select
          className="form-select"
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

      <div className="mb-3">
        <label className="form-label">Категория</label>
        <select
          className="form-select"
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
        >
          <option value="">Все категории</option>
          {categories.map((cat, index) => (
            <option key={`category-${cat}-${index}`} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <button
        className="btn btn-outline-secondary w-100"
        onClick={onClearFilters}
      >
        <i className="bi bi-x-circle"></i> Сбросить фильтры
      </button>

      <div className="mt-3 text-muted small">
        Найдено: {totalResults}
      </div>

      {/* Кнопки для мобильного меню */}
      {mobileMenuOpen && (
        <div className="d-lg-none mt-3">
          <div className="d-grid gap-2">
            <button
              className="btn btn-primary"
              onClick={onCloseMobileMenu}
            >
              <i className="bi bi-check-lg me-2"></i> Применить фильтры
            </button>
            <button
              className="btn btn-outline-secondary"
              onClick={onCloseMobileMenu}
            >
              <i className="bi bi-x-lg me-2"></i> Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default React.memo(FiltersPanel)
