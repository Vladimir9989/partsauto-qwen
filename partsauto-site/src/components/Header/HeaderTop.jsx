import { FaMapMarkerAlt, FaPhone, FaShoppingCart, FaFacebook, FaInstagram, FaTelegram } from 'react-icons/fa';
import styles from './Header.module.css';

function HeaderTop({ onCartClick, cartItemsCount = 0 }) {
  return (
    <div className={styles.headerTop}>
      <div className={styles.container}>
        <div className={styles.topRow}>
          <div className={styles.locationInfo}>
            <FaMapMarkerAlt className={styles.locationIcon} />
            <span>г. Реж - Екатеринбург</span>
          </div>
          <div className={styles.topRowBlock}>
            <div className={styles.contactInfo}>
              <FaPhone className={styles.contactIcon} />
              <a href="tel:+79826048040">8 (982) 604-80-40</a>
            </div>
            <div className={styles.socialsInfo}>
              <span>Мы в соцсетях:</span>
              <div className={styles.socialsBlock}>
                <FaFacebook className={styles.socialIcon} />
                <FaInstagram className={styles.socialIcon} />
                <FaTelegram className={styles.socialIcon} />
              </div>
            </div>
            {/* Десктопная корзина с обработчиком клика */}
            <div 
              className={styles.desktopCartInfo}
              onClick={onCartClick}
              style={{ cursor: 'pointer' }}
              title="Открыть корзину"
            >
              <FaShoppingCart className={styles.cartIcon} />
              {cartItemsCount > 0 && (
                <span className={styles.cartBadge}>{cartItemsCount}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeaderTop;
