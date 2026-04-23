import { Link } from 'react-router-dom';
import styles from './Header.module.css';

function MobileMenu({ isMenuOpen, onClose, links }) {
  return (
    <>
      <div
        className={`${styles.mobileMenuOverlay} ${isMenuOpen ? styles.visible : ''}`}
        onClick={onClose}
      />
      <div className={`${styles.mobileMenuPanel} ${isMenuOpen ? styles.visible : ''}`}>
        <button className={styles.mobileMenuClose} onClick={onClose}>
          ×
        </button>
        <nav className={styles.mobileNav}>
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={(e) => {
                if (link.onClick) {
                  e.preventDefault();
                  link.onClick(e);
                } else {
                  onClose();
                }
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}

export default MobileMenu;