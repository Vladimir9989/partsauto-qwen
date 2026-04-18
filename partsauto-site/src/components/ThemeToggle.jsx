import { useThemeStore } from '../store/useStore'
import { motion } from 'framer-motion'

const ThemeToggle = () => {
  const { theme, setTheme } = useThemeStore()

  const themes = [
    { value: 'light', icon: 'bi-sun-fill', label: 'Светлая' },
    { value: 'dark', icon: 'bi-moon-stars-fill', label: 'Темная' },
    { value: 'auto', icon: 'bi-circle-half', label: 'Авто' }
  ]

  return (
    <div className="theme-toggle-container">
      <div className="btn-group" role="group" aria-label="Выбор темы">
        {themes.map((t) => (
          <button
            key={t.value}
            type="button"
            className={`btn btn-sm ${theme === t.value ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setTheme(t.value)}
            title={t.label}
            aria-label={t.label}
          >
            <i className={`bi ${t.icon}`}></i>
            <span className="d-none d-md-inline ms-1">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default ThemeToggle
