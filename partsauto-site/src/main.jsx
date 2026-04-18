import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Инициализация темы при загрузке приложения
const initTheme = () => {
  const savedTheme = localStorage.getItem('partsauto-theme')
  if (savedTheme) {
    try {
      const { state } = JSON.parse(savedTheme)
      const theme = state?.theme || 'light'
      
      if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
      } else {
        document.documentElement.setAttribute('data-theme', theme)
      }
    } catch (e) {
      document.documentElement.setAttribute('data-theme', 'light')
    }
  } else {
    document.documentElement.setAttribute('data-theme', 'light')
  }
}

initTheme()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
