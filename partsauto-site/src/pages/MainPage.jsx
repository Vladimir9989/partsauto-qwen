import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './MainPage.module.css'
import CarsScroller from '../components/CarsScroller/CarsScroller'
import CarSearch from '../components/CarSearch/CarSearch'
import ContactsSection from '../components/ContactsSection/ContactsSection'
import { useTheme } from '../context/ThemeContext'
import { IconMax, IconAvito, IconVK, IconTelegram, IconDrom } from '../components/Icons'

function MainPage() {
  const { theme } = useTheme()
  const [imageIndex, setImageIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const navigate = useNavigate()

  const handleContactLinkClick = () => {
    setIsModalOpen(false)
    setTimeout(() => {
      document.getElementById('contacts')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

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
              Если вы не нашли нужную деталь на сайте - просто{' '}
              <button className={styles.modalLinkBtn} onClick={handleContactLinkClick}>
                свяжитесь с нами
              </button>
              , удобным для вас способом!
            </p>
            <div className={styles.modalContacts}>
              <div className={styles.modalSocials}>
                <a href="https://max.ru/u/..." target="_blank" rel="noopener noreferrer">
                  <IconMax className={styles.modalSocialIcon} />
                </a>
                <a href="https://www.avito.ru/brands/i52916411" target="_blank" rel="noopener noreferrer">
                  <IconAvito className={styles.modalSocialIcon} />
                </a>
                <a href="https://vk.ru/razbor_vykup" target="_blank" rel="noopener noreferrer">
                  <IconVK className={styles.modalSocialIcon} />
                </a>
                <a href="https://t.me/razbor_vykup96" target="_blank" rel="noopener noreferrer">
                  <IconTelegram className={styles.modalSocialIcon} />
                </a>
                <a href="https://baza.drom.ru/user/Nikitin1588/" target="_blank" rel="noopener noreferrer">
                  <IconDrom className={styles.modalSocialIcon} />
                </a>
              </div>
              <a href="tel:+79826048040" className={styles.modalPhone}>
                <i className="bi bi-telephone-fill"></i> +7 (982) 604-80-40
              </a>
            </div>
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