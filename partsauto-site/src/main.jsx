import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Инициализация темы при загрузке приложения
// Используем тот же ключ localStorage, что и ThemeContext
const initTheme = () => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    try {
      const theme = savedTheme || 'dark'
      document.documentElement.setAttribute('data-theme', theme)
    } catch (e) {
      document.documentElement.setAttribute('data-theme', 'dark')
    }
  } else {
    document.documentElement.setAttribute('data-theme', 'dark')
  }
}

initTheme()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
