import React from 'react'

// Компонент скелетона для карточки товара во время загрузки
const SkeletonCard = () => {
  return (
    <div className="card card-product h-100">
      <div className="skeleton skeleton-image" style={{ height: '200px' }}></div>
      <div className="card-body d-flex flex-column">
        <div className="skeleton skeleton-text mb-2" style={{ width: '80%', height: '20px' }}></div>
        <div className="skeleton skeleton-text mb-3" style={{ width: '40%', height: '24px' }}></div>
        <div className="skeleton skeleton-text mb-2" style={{ width: '60%', height: '16px' }}></div>
        <div className="skeleton skeleton-text mb-2" style={{ width: '70%', height: '16px' }}></div>
        <div className="mt-auto">
          <div className="skeleton skeleton-button" style={{ height: '36px' }}></div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(SkeletonCard)
