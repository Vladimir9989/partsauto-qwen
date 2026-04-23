import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { HelmetProvider } from 'react-helmet-async'
import { ThemeProvider } from './context/ThemeContext'
import CatalogPage from './pages/CatalogPage'
import MainPage from './pages/MainPage'
import AdminPage from './pages/AdminPage'
import NewsPage from './pages/NewsPage'
import NewsDetailPage from './pages/NewsDetailPage'
import CarBuybackPage from './pages/CarBuybackPage'
import DeliveryPage from './pages/DeliveryPage'
import WarrantyPage from './pages/WarrantyPage'
import CartPage from './pages/CartPage'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import { useCartStore } from './store/useCartStore'

function App() {
  const { totalItems } = useCartStore()

  return (
    <HelmetProvider>
      <ThemeProvider>
        <Router>
          <Header cartItemsCount={totalItems} />
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:id" element={<NewsDetailPage />} />
          <Route path="/car-buyback" element={<CarBuybackPage />} />
          <Route path="/delivery" element={<DeliveryPage />} />
          <Route path="/warranty" element={<WarrantyPage />} />
        </Routes>
        <Footer />
        <Toaster
           position="top-right"
           toastOptions={{
             duration: 3000,
             style: {
               background: 'var(--bg-primary)',
               color: 'var(--text-primary)',
               pointerEvents: 'none',
               border: '1px solid var(--border-color)',
             },
             success: {
               duration: 2000,
               iconTheme: {
                 primary: '#10b981',
                 secondary: 'var(--bg-primary)',
               },
             },
             error: {
               duration: 3000,
               iconTheme: {
                 primary: '#ef4444',
                 secondary: 'var(--bg-primary)',
               },
             },
           }}
         />
       </Router>
      </ThemeProvider>
     </HelmetProvider>
   )
 }

export default App
