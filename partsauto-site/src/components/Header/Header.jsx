import { useState } from 'react';
import HeaderTop from './HeaderTop';
import HeaderBottom from './HeaderBottom';
import MobileMenu from './MobileMenu';
import styles from './Header.module.css';

function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <HeaderTop />
      <HeaderBottom />
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </header>
  );
}

export default Header;