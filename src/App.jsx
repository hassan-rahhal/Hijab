import { Routes, Route } from 'react-router-dom';
import Home from './Home';
import ShopPage from './ShopPage';
import ProductDetail from './ProductDetail';
import CartPage from './CartPage';
import CheckoutPage from './CheckoutPage';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/shop" element={<ShopPage />} />
      <Route path="/product/:slug" element={<ProductDetail />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />

      {/* Hidden admin routes — not linked anywhere in the site's nav or footer */}
      <Route path="/portal-x7k9-login" element={<AdminLogin />} />
      <Route path="/portal-x7k9" element={<AdminDashboard />} />
    </Routes>
  );
}

export default App;
