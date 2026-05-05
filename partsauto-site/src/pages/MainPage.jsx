import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './MainPage.module.css'
import CarsScroller from '../components/CarsScroller/CarsScroller'
import CarSearch from '../components/CarSearch/CarSearch'
import ContactsSection from '../components/ContactsSection/ContactsSection'
import { useTheme } from '../context/ThemeContext'

function MainPage() {
  const { theme } = useTheme()
  const [imageIndex, setImageIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const navigate = useNavigate()

  const darkImages = ['url(/main-bg.jpg)', 'url(/main-bg-2.jpg)']
  const lightImages = ['url(/main-bg-blue.jpg)', 'url(/main-bg-blue-2.jpg)']
  const images = theme === 'dark' ? darkImages : lightImages
  const backgroundImage = images[imageIndex]

  useEffect(() => {
    setImageIndex(0)
    const interval = setInterval(() => {
      setImageIndex((prev) => (prev + 1) % images.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [theme, images.length])

  return (
    <>
      <Helmet>
        <title>Разбор Выкуп - Выкуп авто</title>
        <meta name="description" content="Выкуп авто в любом состоянии деньги сразу" />
      </Helmet>
      <div className={styles.jumbotron} style={{ cursor: 'pointer', backgroundImage }}>
        <div className={styles.content}>
          <Link to="/car-buyback" style={{ textDecoration: 'none' }}>
            <h1 className={styles.title}>
              <span
                className={styles.normalText}
                data-text="Выкуп авто в любом состоянии "
              >
                Выкуп авто в любом состоянии
              </span>
              <span className={styles.accent}> деньги сразу</span>
            </h1>
          </Link>
        </div>

        {/* Комикс-облачка и кнопка */}
        <div
          className={`${styles.comicCloud} ${styles.cloudLeft}`}
          onClick={() => {
            window.scrollTo({ top: document.getElementById('contacts')?.offsetTop || 0, behavior: 'smooth' })
          }}
        >
          Не нашли нужную запчасть?
        </div>
        <div
          className={`${styles.comicCloud} ${styles.cloudRight}`}
          onClick={() => {
            window.scrollTo({ top: document.getElementById('contacts')?.offsetTop || 0, behavior: 'smooth' })
          }}
        >
          Свяжитесь с нами
        </div>
        <button className={styles.detailBtn} onClick={() => setIsModalOpen(true)}>
          Подробнее
        </button>
      </div>


      {/* Модальное окно */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setIsModalOpen(false)}>×</button>
            <h3 className={styles.modalTitle}>Не нашли нужную запчасть?</h3>
            <p className={styles.modalText}>
              В каталоге на сайте представлена только часть нашего ассортимента.<br/><br/>
              В наличии <strong>более 200 000 запчастей!</strong><br/><br/>
              Если вы не нашли нужную деталь на сайте - просто свяжитесь с нами, удобным для вас способом!
            </p>
            <button className={styles.modalBtn} onClick={() => setIsModalOpen(false)}>Хорошо, спасибо</button>
          </div>
        </div>
      )}

      <CarsScroller />
      <CarSearch />
      <ContactsSection id="contacts" />
    </>
  )
}

export default MainPage