import { useState, useEffect } from 'react';
import HeaderTop from './HeaderTop';
import HeaderBottom from './HeaderBottom';
import MobileMenu from './MobileMenu';
import styles from './Header.module.css';

const navLinks = [
  { to: '/', label: 'Главная' },
  { to: '/catalog', label: 'Каталог запчастей' },
  { to: '/delivery', label: 'Оплата и доставка' },
  { to: '/contacts', label: 'Контакты' },
  { to: '/news', label: 'Новости о нас' },
  { to: '/warranty', label: 'Гарантия и возврат' },
];

function Header({ onCartClick, cartItemsCount = 0 }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isMobileMenuOpen]);

  return (
    <header className={styles.header}>
      <HeaderTop onCartClick={onCartClick} cartItemsCount={cartItemsCount} />
      <HeaderBottom 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        onCartClick={onCartClick}
        cartItemsCount={cartItemsCount}
      />
      <MobileMenu
        isMenuOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        links={navLinks}
      />
    </header>
  );
}

export default Header;
