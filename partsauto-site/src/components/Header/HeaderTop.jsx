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
                {/* MAX со ссылкой */}
                <a href="https://max.ru/u/f9LHodD0cOJoDb7kIscXdjgziJ349cODdwYvmd-N8YuLY1aqneOJbblNc8k" target="_blank" rel="noopener noreferrer">
                  <IconMax className={styles.socialIcon} />
                </a>
                {/* Avito со ссылкой */}
                <a href="https://www.avito.ru/brands/i52916411" target="_blank" rel="noopener noreferrer">
                  <IconAvito className={styles.socialIcon} />
                </a>
                {/* VK со ссылкой */}
                <a href="https://vk.ru/razbor_vykup" target="_blank" rel="noopener noreferrer">
                  <IconVK className={styles.socialIcon} />
                </a>
                {/* Telegram со ссылкой */}
                <a href="https://t.me/razbor_vykup96" target="_blank" rel="noopener noreferrer">
                  <IconTelegram className={styles.socialIcon} />
                </a>
                {/* Drom со ссылкой */}
                <a href="https://baza.drom.ru/user/Nikitin1588/" target="_blank" rel="noopener noreferrer">
                  <IconDrom className={styles.socialIcon} />
                </a>
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
