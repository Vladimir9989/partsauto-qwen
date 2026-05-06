import React from 'react'
import styles from './ContactsSection.module.css'

const ContactsSection = () => {
  return (
    <section className={styles.contactsSection} id="contacts">
      <div className={styles.container}>
        <h2 className={styles.title}>Контакты</h2>
        <div className={styles.contactsGrid}>
          {/* Первая карточка - Реж */}
          <div className={styles.contactCard}>
            <div className={styles.cardContent}>
              <div className={styles.cardInfo}>
                <h3 className={styles.cardTitle}>Пункт выдачи товаров Разбор Выкуп</h3>
                
                <div className={styles.contactItem}>
                  <i className="bi bi-geo-alt"></i>
                  <span>г. Реж, ул. Трудовая 95/2</span>
                </div>
                
                <div className={styles.contactItem}>
                  <i className="bi bi-telephone"></i>
                  <a href="tel:+79826048040">8 (982) 604-80-40</a>
                </div>
                
                <div className={styles.contactItem}>
                  <i className="bi bi-envelope"></i>
                  <a href="mailto:razbor.vykup@mail.ru">razbor.vykup@mail.ru</a>
                </div>
                
                <div className={styles.contactItem}>
                  <i className="bi bi-clock"></i>
                  <span>Пн-Пт: 9:00-17:00, Сб-Вс: Выходной</span>
                </div>
              </div>
              
              <div className={styles.cardMap}>
                <iframe
                  src="https://yandex.ru/map-widget/v1/?ll=61.352828,57.371336&z=17&pt=61.352828,57.371336,pm2blm"
                  width="100%"
                  height="250"
                  frameBorder="0"
                  title="Карта Режа"
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </div>
          {/* Вторая карточка - Екатеринбург */}
          <div className={styles.contactCard}>
            <div className={styles.cardContent}>
              <div className={styles.cardInfo}>
                <h3 className={styles.cardTitle}>Пункт выдачи товаров Разбор Выкуп</h3>
                
                <div className={styles.contactItem}>
                  <i className="bi bi-geo-alt"></i>
                  <span>г. Екатеринбург, ул. Блюхера, 32</span>
                </div>
                
                <div className={styles.contactItem}>
                  <i className="bi bi-telephone"></i>
                  <a href="tel:+79826048040">8 (982) 604-80-40</a>
                </div>
                
                <div className={styles.contactItem}>
                  <i className="bi bi-envelope"></i>
                  <a href="mailto:razbor.vykup@mail.ru">razbor.vykup@mail.ru</a>
                </div>
                
                <div className={styles.contactItem}>
                  <i className="bi bi-clock"></i>
                  <span>Пн-Пт: 9:00-17:00, Сб-Вс: Выходной</span>
                </div>
              </div>
              
              <div className={styles.cardMap}>
                <iframe
                  src="https://yandex.ru/map-widget/v1/?ll=60.652949,56.856499&z=17&pt=60.652949,56.856499,pm2rdm"
                  width="100%"
                  height="250"
                  frameBorder="0"
                  title="Карта Екатеринбурга"
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>
  )
}

export default ContactsSection