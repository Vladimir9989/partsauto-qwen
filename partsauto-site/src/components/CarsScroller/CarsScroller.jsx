import React, { useState, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import styles from './CarsScroller.module.css'

// Компонент слайдера изображений для карточки
const ImageSlider = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  useEffect(() => {
    if (images.length <= 1) return
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [images.length])
  
  const goToPrev = (e) => {
    e.stopPropagation()
    setCurrentIndex(prev => prev === 0 ? images.length - 1 : prev - 1)
  }
  
  const goToNext = (e) => {
    e.stopPropagation()
    setCurrentIndex(prev => (prev + 1) % images.length)
  }
  
  return (
    <div className={styles.sliderContainer}>
      <img src={images[currentIndex]} alt={title} className={styles.carImage} />
      {images.length > 1 && (
        <>
          <button className={styles.sliderPrev} onClick={goToPrev} aria-label="Предыдущее фото">‹</button>
          <button className={styles.sliderNext} onClick={goToNext} aria-label="Следующее фото">›</button>
          <div className={styles.sliderDots}>
            {images.map((_, idx) => (
              <span
                key={idx}
                className={`${styles.dot} ${idx === currentIndex ? styles.activeDot : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentIndex(idx)
                }}
                aria-label={`Фото ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// Компонент слайдера изображений для модального окна
const ModalImageSlider = ({ images, title, onImageClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  useEffect(() => {
    if (images.length <= 1) return
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [images.length])
  
  const goToPrev = (e) => {
    e.stopPropagation()
    setCurrentIndex(prev => prev === 0 ? images.length - 1 : prev - 1)
  }
  
  const goToNext = (e) => {
    e.stopPropagation()
    setCurrentIndex(prev => (prev + 1) % images.length)
  }
  
  const handleImageClick = (e) => {
    e.stopPropagation()
    if (onImageClick) {
      onImageClick(images[currentIndex])
    }
  }
  
  return (
    <div className={styles.modalSliderContainer}>
      <img
        src={images[currentIndex]}
        alt={title}
        className={styles.modalSliderImage}
        onClick={handleImageClick}
        style={{ cursor: 'zoom-in' }}
      />
      {images.length > 1 && (
        <>
          <button className={styles.modalSliderPrev} onClick={goToPrev} aria-label="Предыдущее фото">‹</button>
          <button className={styles.modalSliderNext} onClick={goToNext} aria-label="Следующее фото">›</button>
          <div className={styles.modalSliderDots}>
            {images.map((_, idx) => (
              <span
                key={idx}
                className={`${styles.modalDot} ${idx === currentIndex ? styles.modalDotActive : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentIndex(idx)
                }}
                aria-label={`Фото ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// Статические данные (fallback)
const staticCards = [
  {
    id: 1014,
    title: "Поступил в разбор Lada Vesta 2020г 1.6л МКПП двс 21129",
    date: "29 января 2026",
    link: "/news/1014",
    images: []
  },
  {
    id: 1013,
    title: "Поступил в разбор Kia RIO 2013г 1.6л МКПП двс G4FC",
    date: "29 января 2026",
    link: "/news/1013",
    images: []
  },
  {
    id: 1012,
    title: "Поступил в разбор Kia Spectra 2008г 1.6л МКПП двс S6D",
    date: "29 января 2026",
    link: "/news/1012",
    images: []
  },
  {
    id: 1009,
    title: "Поступил в разбор Renault Logan 2008г 1.4л двс K7JA710",
    date: "6 октября 2025",
    link: "/news/1009",
    images: []
  },
  {
    id: 1008,
    title: "Поступил в разбор Mitsubishi Colt 2005г 1.3л",
    date: "6 октября 2025",
    link: "/news/1008",
    images: []
  },
  {
    id: 1006,
    title: "Поступил в разбор Chevrolet Lacetti 2008г 1.6л 109 л.с двс F16D3",
    date: "11 июля 2025",
    link: "/news/1006",
    images: []
  },
  {
    id: 1005,
    title: "Поступил в разбор Opel Corsa D 2008г 1.2л 80 л.с двс Z12XER",
    date: "10 июля 2025",
    link: "/news/1005",
    images: []
  },
  {
    id: 1004,
    title: "Поступил в разбор Mitsubishi Lancer 9 2005г STW 1.6л 98 л.с двс 4G18",
    date: "10 июля 2025",
    link: "/news/1004",
    images: []
  }
]

const CarsScroller = () => {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCard, setSelectedCard] = useState(null)
  const [lightboxImage, setLightboxImage] = useState(null)

  const handleCardClick = (card) => {
    setSelectedCard(card)
  }

  const handleCloseModal = () => {
    setSelectedCard(null)
  }

  const handleImageClick = (imageUrl) => {
    setLightboxImage(imageUrl)
  }

  const handleCloseLightbox = () => {
    setLightboxImage(null)
  }

  useEffect(() => {
    fetch('/api/cars')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.length > 0) {
          setCards(data.data)
        } else {
          setCards(staticCards)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Ошибка загрузки машин:', err)
        setCards(staticCards)
        setLoading(false)
      })
  }, [])

  // Функция для определения иконки (если нет фото)
  const getCarIcon = (title) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('lada') || lowerTitle.includes('vesta')) return '🚗';
    if (lowerTitle.includes('kia')) return '🚙';
    if (lowerTitle.includes('renault') || lowerTitle.includes('logan')) return '🚕';
    if (lowerTitle.includes('mitsubishi') || lowerTitle.includes('colt') || lowerTitle.includes('lancer')) return '🚘';
    if (lowerTitle.includes('chevrolet') || lowerTitle.includes('lacetti')) return '🚚';
    if (lowerTitle.includes('opel') || lowerTitle.includes('corsa')) return '🚗';
    return '🚙';
  };

  // Обработчик клавиатуры для закрытия модального окна по Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedCard) {
        handleCloseModal()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedCard])

  if (loading) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.title}>Машины в разборе</h2>
          <div className={styles.loader}>Загрузка...</div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.title}>Машины в разборе</h2>
          
          <div className={styles.swiperWrapper}>
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={20}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 4 }
              }}
              className={styles.swiper}
            >
              {cards.map(card => (
                <SwiperSlide key={card.id}>
                  <div className={styles.card}>
                    <div
                      className={styles.imagePlaceholder}
                      onClick={() => handleCardClick(card)}
                      style={{ cursor: 'pointer' }}
                    >
                      {card.images && card.images.length > 0 ? (
                        <ImageSlider images={card.images} title={card.title} />
                      ) : (
                        <div className={styles.placeholderContent}>
                          {getCarIcon(card.title)}
                        </div>
                      )}
                    </div>
                    <time className={styles.date}>{card.date}</time>
                    <a
                      className={styles.cardTitle}
                      onClick={() => handleCardClick(card)}
                      style={{ cursor: 'pointer' }}
                    >
                      {card.title}
                    </a>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>
      
      {selectedCard && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={handleCloseModal}>×</button>
            
            <div className={styles.modalImage}>
              {selectedCard.images && selectedCard.images.length > 0 ? (
                <ModalImageSlider
                  images={selectedCard.images}
                  title={selectedCard.title}
                  onImageClick={handleImageClick}
                />
              ) : (
                <div className={styles.modalNoImage}>
                  {getCarIcon(selectedCard.title)}
                </div>
              )}
            </div>
            
            <div className={styles.modalInfo}>
              <h3 className={styles.modalTitle}>{selectedCard.title}</h3>
              <time className={styles.modalDate}>{selectedCard.date}</time>
              {selectedCard.description && (
                <p className={styles.modalDescription}>{selectedCard.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Lightbox для увеличенного просмотра изображения */}
      {lightboxImage && (
        <div className={styles.lightboxOverlay} onClick={handleCloseLightbox}>
          <button className={styles.lightboxClose} onClick={handleCloseLightbox}>×</button>
          <img src={lightboxImage} alt="Увеличенное изображение" className={styles.lightboxImage} />
        </div>
      )}
    </>
  )
}

export default CarsScroller