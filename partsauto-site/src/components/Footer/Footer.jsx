import React, { useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FaPhone, FaMapMarkerAlt } from 'react-icons/fa'
import { useTheme } from '../../context/ThemeContext'
import styles from './Footer.module.css'

const Footer = () => {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const logoSrc = theme === 'dark' ? '/logo-white.png' : '/logo-blue.png'
  const currentYear = new Date().getFullYear()

  // Флаг для отслеживания, нужно ли скроллить после навигации
  const shouldScroll = useRef(false)

  // Слушаем изменение локации для скролла после перехода
  useEffect(() => {
    if (shouldScroll.current && location.pathname === '/') {
      // Ждём рендера MainPage и появления элемента contacts
      const timeout = setTimeout(() => {
        document.getElementById('contacts')?.scrollIntoView({ behavior: 'smooth' })
        shouldScroll.current = false
      }, 300)
      return () => clearTimeout(timeout)
    }
  }, [location.pathname])

  const handleContactClick = () => {
    if (location.pathname === '/') {
      // Если на главной - просто скролл
      document.getElementById('contacts')?.scrollIntoView({ behavior: 'smooth' })
    } else {
      // Если на другой странице - переход на главную + скролл
      shouldScroll.current = true
      navigate('/')
    }
  }
  
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.column}>
            <Link to="/" className={styles.logoLink}>
              <img src={logoSrc} alt="Разбор Выкуп" className={styles.logoImage} />
            </Link>
            <p className={styles.description}>
              Оригинальные автозапчасти для вашего автомобиля
            </p>
          </div>
          
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Навигация</h4>
            <ul className={styles.links}>
              <li><Link to="/catalog">Каталог запчастей</Link></li>
              <li><Link to="/car-buyback">Выкуп авто</Link></li>
              <li><Link to="/news">Новости</Link></li>
              <li><button className={styles.linkButton} onClick={handleContactClick}>Контакты</button></li>
            </ul>
          </div>
          
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Контакты</h4>
            <ul className={styles.contacts}>
              <li>
                <FaPhone className={styles.contactIcon} />
                <a href="tel:+79826048040">8 (982) 604-80-40</a>
              </li>
              <li>
                <FaMapMarkerAlt className={styles.locationIcon} />
                <span>г. Реж - Екатеринбург</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className={styles.bottom}>
          <p>© {currentYear} Разбор Выкуп. Все права защищены.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer