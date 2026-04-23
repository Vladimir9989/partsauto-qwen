import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { HelmetProvider } from 'react-helmet-async'
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
      </Router>
    </HelmetProvider>
  )
}

export default App
