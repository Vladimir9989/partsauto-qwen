import React, { useMemo, useCallback } from 'react'

// Компонент пагинации
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Генерация массива страниц для отображения
  const pages = useMemo(() => {
    if (totalPages <= 1) return []
    
    const maxVisible = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    let endPage = Math.min(totalPages, startPage + maxVisible - 1)

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1)
    }

    const pagesArray = []
    for (let i = startPage; i <= endPage; i++) {
      pagesArray.push(i)
    }
    return pagesArray
  }, [currentPage, totalPages])

  const handlePrevious = useCallback(() => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }, [currentPage, onPageChange])

  const handleNext = useCallback(() => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }, [currentPage, totalPages, onPageChange])

  const handlePageClick = useCallback((page) => {
    onPageChange(page)
  }, [onPageChange])

  if (totalPages <= 1) return null

  const startPage = pages[0]
  const endPage = pages[pages.length - 1]

  return (
    <nav className="mt-4">
      <ul className="pagination justify-content-center flex-wrap">
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button 
            className="page-link" 
            onClick={handlePrevious} 
            disabled={currentPage === 1}
            aria-label="Предыдущая страница"
          >
            <i className="bi bi-chevron-left"></i> Назад
          </button>
        </li>

        {startPage > 1 && (
          <>
            <li className="page-item">
              <button className="page-link" onClick={() => handlePageClick(1)}>1</button>
            </li>
            {startPage > 2 && (
              <li className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            )}
          </>
        )}

        {pages.map(page => (
          <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => handlePageClick(page)}
              aria-label={`Страница ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          </li>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <li className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            )}
            <li className="page-item">
              <button className="page-link" onClick={() => handlePageClick(totalPages)}>
                {totalPages}
              </button>
            </li>
          </>
        )}

        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button 
            className="page-link" 
            onClick={handleNext} 
            disabled={currentPage === totalPages}
            aria-label="Следующая страница"
          >
            Вперёд <i className="bi bi-chevron-right"></i>
          </button>
        </li>
      </ul>
    </nav>
  )
}

export default React.memo(Pagination)
