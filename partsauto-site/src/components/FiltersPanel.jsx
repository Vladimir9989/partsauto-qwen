import React, { useCallback } from 'react'

// Компонент панели фильтров
const FiltersPanel = ({
  filters,
  brands,
  categories,
  totalResults,
  priceError,
  priceMinRef,
  priceMaxRef,
  onFilterChange,
  onPriceChange,
  onClearFilters,
  mobileMenuOpen,
  onCloseMobileMenu
}) => {
  
  const handleFilterChange = useCallback((key, value) => {
    onFilterChange(key, value)
  }, [onFilterChange])

  const handlePriceChange = useCallback((key, value) => {
    onPriceChange(key, value)
  }, [onPriceChange])

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
        <label className="form-label">Сортировка</label>
        <select
          className="form-select"
          value={filters.sortBy}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
        >
          <option value="default">По умолчанию</option>
          <option value="price-asc">Цена: по возрастанию</option>
          <option value="price-desc">Цена: по убыванию</option>
          <option value="name-asc">Название: А-Я</option>
          <option value="name-desc">Название: Я-А</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Бренд</label>
        <select
          className="form-select"
          value={filters.brand}
          onChange={(e) => handleFilterChange('brand', e.target.value)}
        >
          <option value="">Все бренды</option>
          {brands.map((brand, index) => (
            <option key={`brand-${brand}-${index}`} value={brand}>{brand}</option>
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
