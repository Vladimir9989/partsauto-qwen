import React from 'react'
import { Link } from 'react-router-dom'
import { FaPhone, FaMapMarkerAlt } from 'react-icons/fa'
import styles from './Footer.module.css'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.column}>
            <Link to="/" className={styles.logoLink}>
              <img src="/logo.png" alt="PartsAuto" className={styles.logoImage} />
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
              <li><Link to="/contacts">Контакты</Link></li>
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
          <p>© {currentYear} PartsAuto. Все права защищены.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer