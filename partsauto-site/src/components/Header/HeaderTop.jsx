import React from 'react';
import { FaMapMarkerAlt, FaPhone, FaStar, FaA, FaVk, FaTelegram, FaShoppingCart, FaCar } from 'react-icons/fa';
import styles from './Header.module.css';

function HeaderTop() {
  return (
    <div className={styles.headerTop}>
      <div className="container">
        <div className="top-row">
          <span className="location-info">
            <FaMapMarkerAlt className="location-icon" />
            <span>Реж-Екатеринбург</span>
          </span>
          <span className="contact-info">
            <FaPhone className="contact-icon" />
            <a href="tel:89826048040">89826048040</a>
          </span>
          <span className="socials-info">
            <span>мы в соц сетях</span>
            <FaStar className="social-icon max" />
            <FaA className="social-icon avito" />
            <FaVk className="social-icon vk" />
            <FaTelegram className="social-icon tg" />
            <FaCar className="social-icon drom" />
          </span>
          <span className="cart-info">
            <FaShoppingCart className="cart-icon" />
            <span className="cart-badge">3</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default HeaderTop;