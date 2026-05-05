import { Helmet } from 'react-helmet-async'
import styles from './DeliveryPage.module.css'

function DeliveryPage() {
  return (
    <>
      <Helmet>
        <title>Оплата и доставка - PartsAuto</title>
        <meta name="description" content="Способы оплаты и доставки автозапчастей по Екатеринбургу и всей России" />
      </Helmet>

      <div className={styles.deliveryPage}>
        <div className={styles.container}>
          <h1 className={styles.pageTitle}>Оплата и доставка</h1>

          <div className={styles.advantagesSection}>
            <h2 className={styles.sectionTitle}>Преимущества</h2>
            <div className={styles.advantagesGrid}>
              <div className={`${styles.advantageCard} ${styles.advantageCardBg1}`}>
                <h3>Большой выбор автозапчастей</h3>
                <p>Более 200 000 товаров в наличии</p>
              </div>
              <div className={`${styles.advantageCard} ${styles.advantageCardBg2}`}>
                <h3>Расширенный сервис</h3>
                <p>Предоставим дополнительную информацию о детали ( фото, видео )</p>
              </div>
              <div className={`${styles.advantageCard} ${styles.advantageCardBg3}`}>
                <h3>Быстрая доставка</h3>
                <p>Отправляем заказы по всей России и странам СНГ</p>
              </div>
            </div>
          </div>

          <div className={styles.content}>
            <div className={styles.paymentSection}>
              <h2 className={styles.sectionTitle}>Способы оплаты</h2>
              <ul className={styles.paymentList}>
                <li>Перевод на карту банка по номеру телефона </li>
                <li>Оплата наличными в офисе компании</li>
              </ul>
            </div>

            <div className={styles.deliverySection}>
              <h2 className={styles.sectionTitle}>Доставка по России через ТК</h2>

              <div className={styles.localDeliverySection}>
                <h2 className={styles.sectionTitle}>Доставка по Екатеринбургу</h2>
                <p>Вы можете заказать доставку по Екатеринбургу до адреса</p>

                {/* <div className={styles.priceGrid}>
                  <div className={styles.priceCard}>
                    <h4>Малогабаритные детали</h4>
                    <p>(все кроме кузовных)</p>
                    <span className={styles.price}>Цена по городу</span>
                  </div>
                  <div className={styles.priceCard}>
                    <h4>Крупногабаритные детали</h4>
                    <p>(кузовные детали)</p>
                    <span className={styles.price}>Цена по городу</span>
                  </div>
                </div> */}

                <p className={styles.paymentInfo}>Оплатить запчасти вы можете наличными или переводом на карту при получении!</p>
              </div>

              <div className={styles.processBlock}>
                <h3 className={styles.subtitle}>При отправке товара мы:</h3>
                <ul className={styles.processList}>
                  <li>Проводим предпродажную подготовку</li>
                  <li>Делаем фотографии товара, для фиксирования его состояния до отправки</li>
                  <li>Высылаем Вам фотографии, для согласования внешнего вида и получения подтверждения его отправки</li>
                  <li>Упаковываем товар в стрейч-пленку</li>
                  <li>Доставляем товар до ТК и сдаем его</li>
                </ul>
              </div>

              <div className={styles.priceBlock}>
                <h3 className={styles.subtitle}>Стоимость доставки до ТК по согласованию</h3>
              </div>

              <div className={styles.trackingBlock}>
                <p>После сдачи товара в ТК, мы высылаем Вам отгрузочные документы и трек-номер, для контроля его нахождения в пути до пункта получения.</p>
                <p className={styles.note}>Доставка груза ТК оплачивается отдельно, при его получении (приблизительную стоимость и сроки транспортировки вы можете узнать на сайте ТК).</p>
              </div>

              <div className={styles.warningBlock}>
                <p className={styles.warning}>⚠️ Обязательно проверьте груз при его получении в ТК.</p>
              </div>

              <div className={styles.tkSection}>
                <h3 className={styles.subtitle}>Транспортные компании, с которыми мы работаем:</h3>
                <div className={styles.tkList}>
                  <span className={styles.tkBadge}>КИТ</span>
                  <span className={styles.tkBadge}>Деловые линии</span>
                  <span className={styles.tkBadge}>Луч</span>
                  <span className={styles.tkBadge}>ПЭК</span>
                  <span className={styles.tkBadge}>Энергия</span>
                  <span className={styles.tkBadge}>СДЭК</span>
                </div>
              </div>

              <div className={styles.importantWarning}>
                <h3>⚠️ ВАЖНО</h3>
                <p>В случае отказа покупателя от жесткой упаковки сохранность таких товаров в процессе доставки не гарантируется. Отказываясь от страховки, вы не только лишаетесь дополнительной гарантии сохранности груза, но и в значительной степени усложняете для себя процедуру возмещения убытков в случае, если в пути с товаром что-то произойдет.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default DeliveryPage