import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import styles from './MainPage.module.css'
import CarsScroller from '../components/CarsScroller/CarsScroller'
import CarSearch from '../components/CarSearch/CarSearch'
import ContactsSection from '../components/ContactsSection/ContactsSection'
import { useTheme } from '../context/ThemeContext'

function MainPage() {
  const { theme } = useTheme()
  const backgroundImage = theme === 'dark' ? 'url(/main-bg.jpg)' : 'url(/main-bg-blue.jpg)'
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Helmet>
        <title>PartsAuto - Выкуп авто</title>
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
        <div className={`${styles.comicCloud} ${styles.cloudLeft}`}>
          Не нашли нужную запчасть?
        </div>
        <div className={`${styles.comicCloud} ${styles.cloudRight}`}>
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
              На самом деле у нас <strong>более 200 000 запчастей</strong> в наличии!<br/><br/>
              Если вы не нашли нужную деталь — просто свяжитесь с нами.<br/><br/>
              <strong>Возможно, именно она ждёт вас на нашем складе!</strong>
            </p>
            <button className={styles.modalBtn} onClick={() => setIsModalOpen(false)}>Хорошо, спасибо</button>
          </div>
        </div>
      )}

      <CarsScroller />
      <CarSearch />
      <ContactsSection />
    </>
  )
}

export default MainPage