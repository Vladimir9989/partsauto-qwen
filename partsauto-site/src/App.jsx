import { useState, useCallback } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { HelmetProvider } from 'react-helmet-async'
import CatalogPage from './pages/CatalogPage'
import MainPage from './pages/MainPage'
import AdminPage from './pages/AdminPage'
import NewsPage from './pages/NewsPage'
import NewsDetailPage from './pages/NewsDetailPage'
import CarBuybackPage from './pages/CarBuybackPage'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import { useCartStore } from './store/useCartStore'
import CartPanel from './components/CartPanel'

function App() {
  const [cartPanelOpen, setCartPanelOpen] = useState(false)
  const { totalItems } = useCartStore()

  const handleToggleCartPanel = useCallback(() => {
    setCartPanelOpen(prev => !prev)
  }, [])

  return (
    <HelmetProvider>
      <Router>
        <Header onCartClick={handleToggleCartPanel} cartItemsCount={totalItems} />
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:id" element={<NewsDetailPage />} />
          <Route path="/car-buyback" element={<CarBuybackPage />} />
        </Routes>
        <Footer />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
              pointerEvents: 'none',
            },
            success: {
              duration: 2000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 3000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <CartPanel isOpen={cartPanelOpen} onClose={() => setCartPanelOpen(false)} />
      </Router>
    </HelmetProvider>
  )
}

export default App
