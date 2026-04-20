import React from 'react';
import { FaMapMarkerAlt, FaStar, FaTag, FaVk, FaTelegram, FaShoppingCart, FaCar } from 'react-icons/fa';
import styles from './Header.module.css';

function HeaderTop() {
  return (
    <div className={styles.headerTop}>
      <div className={styles.container}>
        <div className={styles['top-row']}>
          <span className={styles['location-info']}>
            <FaMapMarkerAlt className={styles['location-icon']} />
            <span>Реж-Екатеринбург</span>
          </span>
          <span className={styles['contact-info']}>
            <a href="tel:89826048040">89826048040</a>
          </span>
          <span className={styles['socials-info']}>
            <span>мы в соц сетях</span>
            <FaStar className={styles['social-icon']} />
            <FaTag className={styles['social-icon']} />
            <FaVk className={styles['social-icon']} />
            <FaTelegram className={styles['social-icon']} />
            <FaCar className={styles['social-icon']} />
          </span>
          <span className={styles['cart-info']}>
            <FaShoppingCart className={styles['cart-icon']} />
            <span className={styles['cart-badge']}>3</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default HeaderTop;