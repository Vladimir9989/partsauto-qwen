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
                <h3 className={styles.cardTitle}>Пункт выдачи товаров ArtRazbor</h3>
                
                <div className={styles.contactItem}>
                  <i className="bi bi-geo-alt"></i>
                  <span>г. Реж, ул. Павлика Морозова, 61</span>
                </div>
                
                <div className={styles.contactItem}>
                  <i className="bi bi-telephone"></i>
                  <a href="tel:+79826048040">8 (982) 604-80-40</a>
                </div>
                
                <div className={styles.contactItem}>
                  <i className="bi bi-envelope"></i>
                  <a href="mailto:info@partsauto.ru">info@partsauto.ru</a>
                </div>
                
                <div className={styles.contactItem}>
                  <i className="bi bi-clock"></i>
                  <span>Пн-Сб: 9:00-20:00, Вс: 9:00-19:00</span>
                </div>
              </div>
              
              <div className={styles.cardMap}>
                <iframe
                  src="https://yandex.ru/map-widget/v1/?um=constructor%3A0907e5d698966e6d8261903851f30b9a2b054695f4db023949fbda44f5648157&source=constructor"
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
                <h3 className={styles.cardTitle}>Пункт выдачи товаров ArtRazbor</h3>
                
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
                  <a href="mailto:info@partsauto.ru">info@partsauto.ru</a>
                </div>
                
                <div className={styles.contactItem}>
                  <i className="bi bi-clock"></i>
                  <span>Пн-Сб: 9:00-20:00, Вс: 9:00-19:00</span>
                </div>
              </div>
              
              <div className={styles.cardMap}>
                <iframe
                  src="https://yandex.ru/map-widget/v1/?um=constructor%3Aafd76b21196d6d26057b6b69d144704cf227ce1aaf6464d207eb75a5e84a14e4&source=constructor"
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