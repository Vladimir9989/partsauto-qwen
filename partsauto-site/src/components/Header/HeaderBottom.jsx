import { Link } from 'react-router-dom';
import styles from './Header.module.css';

function HeaderBottom() {
  return (
    <div className={styles.headerBottom}>
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            PartsAuto
          </Link>
          <nav className="nav-menu">
            <Link to="/">Главная</Link>
            <Link to="/catalog">Каталог</Link>
            <Link to="/favorites">Избранное</Link>
            <Link to="/compare">Сравнение</Link>
          </nav>
        </div>
      </div>
    </div>
  );
}

export default HeaderBottom;