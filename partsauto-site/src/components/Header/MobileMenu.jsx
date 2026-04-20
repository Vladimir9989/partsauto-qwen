import { Link } from 'react-router-dom';
import styles from './Header.module.css';

function MobileMenu({ isOpen, onClose }) {
  return (
    <div className={styles.mobileMenu}>
      <div className={`mobile-menu-overlay ${isOpen ? 'visible' : ''}`} onClick={onClose} />
      <div className={`mobile-menu ${isOpen ? 'visible' : ''}`}>
        <button className="mobile-menu-close" onClick={onClose}>
          ×
        </button>
        <nav className="mobile-nav">
          <Link to="/" onClick={onClose}>Главная</Link>
          <Link to="/catalog" onClick={onClose}>Каталог</Link>
          <Link to="/favorites" onClick={onClose}>Избранное</Link>
          <Link to="/compare" onClick={onClose}>Сравнение</Link>
        </nav>
      </div>
    </div>
  );
}

export default MobileMenu;