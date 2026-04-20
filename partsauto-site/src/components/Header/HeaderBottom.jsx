import { Link } from 'react-router-dom';
import { FaBars, FaShoppingCart, FaChevronDown } from 'react-icons/fa';
import { useState } from 'react';
import styles from './Header.module.css';

function HeaderBottom({ isMobileMenuOpen, setIsMobileMenuOpen, onCartClick, cartItemsCount = 0 }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className={styles.headerBottom}>
      <div className={styles.container}>
        <div className={styles.headerContent}>
          <Link to="/" className={styles.logo}>
            PartsAuto
          </Link>
          
          {/* Десктопная навигация */}
          <nav className={styles.navMenu}>
            <Link to="/catalog">Каталог запчастей</Link>
            <Link to="/delivery">Оплата и доставка</Link>
            <Link to="/contacts">Контакты</Link>
            <Link to="/news">Новости о нас</Link>
            <Link to="/warranty">Гарантия и возврат</Link>
            <Link to="/car-buyback">Выкуп авто</Link>
          </nav>

          {/* Планшетная навигация с дропдауном */}
          <div className={styles.tabletNav}>
            <div className={styles.dropdown}>
              <button 
                className={styles.dropdownBtn}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                Меню <FaChevronDown className={isDropdownOpen ? styles.chevronRotated : ''} />
              </button>
              {isDropdownOpen && (
                <div className={styles.dropdownMenu}>
                  <Link to="/catalog">Каталог запчастей</Link>
                  <Link to="/delivery">Оплата и доставка</Link>
                  <Link to="/contacts">Контакты</Link>
                  <Link to="/news">Новости о нас</Link>
                  <Link to="/warranty">Гарантия и возврат</Link>
                  <Link to="/car-buyback">Выкуп авто</Link>
                </div>
              )}
            </div>
          </div>

          {/* Мобильная группа: корзина + бургер */}
          <div className={styles.mobileRightGroup}>
            <div 
              className={styles.mobileCartInfo}
              onClick={onCartClick}
              style={{ cursor: 'pointer' }}
              title="Открыть корзину"
            >
              <FaShoppingCart className={styles.cartIcon} />
              {cartItemsCount > 0 && (
                <span className={styles.cartBadge}>{cartItemsCount}</span>
              )}
            </div>
            <button 
              className={styles.mobileMenuBtn} 
              aria-label="Меню"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <FaBars />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeaderBottom;
