import { Helmet } from 'react-helmet-async'
import styles from './MainPage.module.css'
import CarsScroller from '../components/CarsScroller/CarsScroller'

function MainPage() {
  const normalText = 'Выкуп авто в любом состоянии '

  return (
    <>
      <Helmet>
        <title>PartsAuto - Выкуп авто</title>
        <meta name="description" content="Выкуп авто в любом состоянии деньги сразу" />
      </Helmet>

      <div className={styles.jumbotron}>
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

      <CarsScroller />
    </>
  )
}

export default MainPage