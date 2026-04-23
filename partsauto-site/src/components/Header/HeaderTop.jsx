import { Link, useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaPhone, FaShoppingCart } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { IconMax, IconAvito, IconVK, IconTelegram, IconDrom, IconSun, IconMoon } from '../Icons';
import { useCartStore } from '../../store/useCartStore';
import { useTheme } from '../../context/ThemeContext';
import styles from './Header.module.css';

function HeaderTop({ cartItemsCount = 0 }) {
  const { totalItems } = useCartStore();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={styles.headerTop}>
      <div className={styles.container}>
        <div className={styles.topRow}>
          <div
            className={styles.locationInfo}
            onClick={() => {
              document.getElementById('contacts')?.scrollIntoView({ behavior: 'smooth' });
            }}
            title="Перейти к контактам"
          >
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
                <IconMax className={styles.socialIcon} />
                <IconAvito className={styles.socialIcon} />
                <IconVK className={styles.socialIcon} />
                <IconTelegram className={styles.socialIcon} />
                <IconDrom className={styles.socialIcon} />
              </div>
            </div>
            {/* Кнопка переключения темы */}
            <button
              onClick={toggleTheme}
              className={styles.themeToggle}
              title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
              aria-label="Переключить тему"
            >
              {theme === 'dark' ? (
                <IconSun className={styles.themeIcon} />
              ) : (
                <IconMoon className={styles.themeIcon} />
              )}
            </button>
            {/* Десктопная корзина с переходом на страницу */}
            <Link
              to="/cart"
              onClick={(e) => {
                if (totalItems === 0) {
                  e.preventDefault();
                  toast.error('Корзина пуста');
                }
              }}
              className={styles.desktopCartInfo}
              style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
              title={totalItems === 0 ? 'Корзина пуста' : 'Перейти в корзину'}
            >
              <FaShoppingCart className={styles.cartIcon} />
              {totalItems > 0 && (
                <span className={styles.cartBadge}>{totalItems}</span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeaderTop;
