import { Helmet } from 'react-helmet-async'
import styles from './CarBuybackPage.module.css'

function CarBuybackPage() {
  return (
    <>
      <Helmet>
        <title>Выкуп авто - PartsAuto</title>
        <meta name="description" content="Выкуп автомобилей в любом состоянии. Деньги сразу от 10 000 рублей." />
      </Helmet>

      <div className={styles.buybackPage}>
        <div className={styles.container}>
          <h1 className={styles.pageTitle}>Выкуп авто</h1>
          
          <div className={styles.content}>
            {/* Основной блок с предложением */}
            <div className={styles.mainBlock}>
              <div className={styles.offerCard}>
                <h2 className={styles.offerTitle}>Компания Разбор Выкуп платит от 10 000 рублей</h2>
                <p className={styles.offerText}>
                  за предложенные к выкупу автомобили в Уральском регионе и соседних областях.
                </p>
                <p className={styles.offerTextAccent}>
                  выкупим ваш автомобиль в любом состоянии: целые , после ДТП, неисправные
                </p>
              </div>
            </div>

            {/* Блок с условием выплаты */}
            <div className={styles.conditionCard}>
              <h3 className={styles.cardTitle}>Как получить выплату?</h3>
              <div className={styles.conditionList}>
                <div className={styles.conditionItem}>
                  <div className={styles.conditionNumber}>1</div>
                  <div className={styles.conditionText}>
                    Обратиться к нашим менеджерам <a href="tel:+79000466636">+7 982 604-80-40</a> и предложить авто на выкуп
                  </div>
                </div>
                <div className={styles.conditionItem}>
                  <div className={styles.conditionNumber}>2</div>
                  <div className={styles.conditionText}>
                    Если вашу заявку возьмут в работу, предоставить контакты собственника или продавца автомобиля
                  </div>
                </div>
                <div className={styles.conditionItem}>
                  <div className={styles.conditionNumber}>3</div>
                  <div className={styles.conditionText}>
                    О ходе сделки вас проинформируют по WhatsApp или другим удобным для вас способом
                  </div>
                </div>
              </div>
            </div>

            {/* Блок с гарантией выплаты */}
            <div className={styles.guaranteeCard}>
              <h3 className={styles.cardTitle}>Ваша гарантия</h3>
              <div className={styles.guaranteeText}>
                <p>Если менеджеры нашей компании выкупают авто по Вашей рекомендации, то Вам гарантирована денежная выплата от 10 000 рублей и больше.</p>
                <p className={styles.highlight}>Выплату получает тот, кто предоставил контакт первым.</p>
              </div>
            </div>

            {/* Блок с условиями акции */}
            <div className={styles.termsCard}>
              <h3 className={styles.cardTitle}>Условия акции</h3>
              <ul className={styles.termsList}>
                <li>В акции участвуют все легковые автомобили, грузовые автомобили, мототехника, спецтехника</li>
                <li>Выплаты производятся за автомобили, которые не опубликованы на сайтах Авито, Дром и в других открытых источниках</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CarBuybackPage