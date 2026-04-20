import { Link } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import { useFavoritesStore, useCompareStore } from '../store/useStore'

const OldHeader = () => {
  const { favorites } = useFavoritesStore()
  const { compareList } = useCompareStore()

  return (
    <header className="bg-primary text-white py-3 mb-4">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="mb-1 h3"><i className="bi bi-gear-wide-connected"></i> PartsAuto</h1>
            <p className="mb-0 small d-none d-md-block">Каталог автозапчастей</p>
          </div>
          
          <div className="d-flex gap-2 align-items-center">
            <Link to="/favorites" className="btn btn-outline-light position-relative">
              <i className="bi bi-heart-fill"></i>
              <span className="d-none d-md-inline ms-1">Избранное</span>
              {favorites.length > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {favorites.length}
                </span>
              )}
            </Link>
            
            <Link to="/compare" className="btn btn-outline-light position-relative">
              <i className="bi bi-arrow-left-right"></i>
              <span className="d-none d-md-inline ms-1">Сравнение</span>
              {compareList.length > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-info">
                  {compareList.length}
                </span>
              )}
            </Link>
            
            <ThemeToggle />
            
            <button
              className="btn btn-outline-light d-md-none"
              onClick={() => {}}
              aria-label="Мобильное меню"
            >
              <i className="bi bi-filter"></i>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default OldHeader