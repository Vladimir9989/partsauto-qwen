import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import styles from './MainPage.module.css'
import CarsScroller from '../components/CarsScroller/CarsScroller'
import CarSearch from '../components/CarSearch/CarSearch'
import ContactsSection from '../components/ContactsSection/ContactsSection'
import { useTheme } from '../context/ThemeContext'

function MainPage() {
  const { theme } = useTheme()
  const backgroundImage = theme === 'dark' ? 'url(/main-bg.jpg)' : 'url(/main-bg-blue.jpg)'

  return (
    <>
      <Helmet>
        <title>PartsAuto - Выкуп авто</title>
        <meta name="description" content="Выкуп авто в любом состоянии деньги сразу" />
      </Helmet>

      <Link to="/car-buyback" style={{ textDecoration: 'none' }}>
        <div className={styles.jumbotron} style={{ cursor: 'pointer', backgroundImage }}>
          <div className={styles.content}>
            <h1 className={styles.title}>
              <span
                className={styles.normalText}
                data-text="Выкуп авто в любом состоянии "
              >
                Выкуп авто в любом состоянии
              </span>
              <span className={styles.accent}> деньги сразу</span>
            </h1>
          </div>
        </div>
      </Link>

      <CarsScroller />
      <CarSearch />
      <ContactsSection />
    </>
  )
}

export default MainPage