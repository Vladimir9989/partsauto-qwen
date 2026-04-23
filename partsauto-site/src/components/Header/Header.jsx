import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import HeaderTop from './HeaderTop';
import HeaderBottom from './HeaderBottom';
import MobileMenu from './MobileMenu';
import styles from './Header.module.css';

function Header({ cartItemsCount = 0 }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToContacts = () => {
    const contactsElement = document.getElementById('contacts');
    if (contactsElement) {
      const headerHeight = document.querySelector('header')?.offsetHeight || 0;
      const elementPosition = contactsElement.getBoundingClientRect().top + window.scrollY;
      const scrollPosition = elementPosition - headerHeight - 20;
      
      window.scrollTo({
        top: Math.max(0, scrollPosition),
        behavior: 'smooth'
      });
    }
  };

  const handleContactsClick = (e) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        scrollToContacts();
      }, 350);
    } else {
      scrollToContacts();
    }
  };

  const navLinks = [
    { to: '/', label: 'Главная' },
    { to: '/catalog', label: 'Каталог запчастей' },
    { to: '/delivery', label: 'Оплата и доставка' },
    { to: '/contacts', label: 'Контакты', onClick: handleContactsClick },
    { to: '/news', label: 'Новости о нас' },
    { to: '/warranty', label: 'Гарантия и возврат' },
  ];

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    // Cleanup: восстанавливаем overflow при размонтировании
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <header className={styles.header}>
      <HeaderTop cartItemsCount={cartItemsCount} />
      <HeaderBottom
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        onContactsClick={handleContactsClick}
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
