import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE, getSessionId } from './lib/session.js';
import './CartPage.css';

const CATEGORY_SWATCH = {
  Abaya:       'linear-gradient(135deg,#8a9457,#5c6a2f 60%,#3f491f)',
  Echarpe:     'linear-gradient(135deg,#c9bd94,#9aa066 60%,#68713a)',
  Sets:        'linear-gradient(135deg,#7c8a49,#4f5a24 60%,#333c17)',
  Accessories: 'linear-gradient(135deg,#b0a26f,#8a9457 60%,#5c6a2f)',
};

function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadCart() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/cart/${getSessionId()}`);
      if (!res.ok) throw new Error('Request failed');
      setCart(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCart(); }, []);

  async function changeQty(productId, size, color, newQty) {
    await fetch(`${API_BASE}/cart/${getSessionId()}/item/${productId}?size=${encodeURIComponent(size)}&color=${encodeURIComponent(color)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: newQty }),
    });
    loadCart();
  }

  async function removeItem(productId, size, color) {
    await fetch(`${API_BASE}/cart/${getSessionId()}/item/${productId}?size=${encodeURIComponent(size)}&color=${encodeURIComponent(color)}`, {
      method: 'DELETE',
    });
    loadCart();
  }

  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="cart-page">
      <Link to="/shop" className="back-link">
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6"><path d="M15 18l-6-6 6-6" /></svg>
        Continue Shopping
      </Link>

      <div className="cart-page-header">
        <div className="cart-page-eyebrow">YOUR SELECTION</div>
        <h1 className="cart-page-title serif">Your Cart</h1>
      </div>

      {loading && <p className="cart-page-status">Loading your cart…</p>}
      {error && <p className="cart-page-status">Could not load your cart: {error}</p>}

      {!loading && !error && cart.items.length === 0 && (
        <div className="cart-empty-state">
          <p>Your cart is empty.</p>
          <Link to="/shop" className="cart-empty-link">Browse the collection →</Link>
        </div>
      )}

      {!loading && !error && cart.items.length > 0 && (
        <div className="cart-page-layout">
          <div className="cart-page-items">
            {cart.items.map((item) => {
              const bg = item.image_url
                ? `url('${item.image_url}') center/cover`
                : (CATEGORY_SWATCH[item.category_name] || CATEGORY_SWATCH.Abaya);
              const lineTotal = Number(item.price) * item.quantity;

              return (
                <div key={`${item.product_id}-${item.size}-${item.color}`} className="cart-line">
                  <div className="cart-line-swatch" style={{ background: bg }} />
                  <div className="cart-line-info">
                    <span className="cart-line-name serif">{item.name}</span>
                    <span className="cart-line-meta">
                      {item.category_name} · Size {item.size}
                      {item.color && item.color !== 'Default' ? ` · ${item.color}` : ''}
                    </span>
                    <div className="cart-line-qty">
                      <button
                        className="qty-btn"
                        onClick={() => changeQty(item.product_id, item.size, item.color, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="qty-val">{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => changeQty(item.product_id, item.size, item.color, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                      <button
                        className="cart-line-remove"
                        onClick={() => removeItem(item.product_id, item.size, item.color)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <span className="cart-line-price">${lineTotal.toFixed(2)}</span>
                </div>
              );
            })}
          </div>

          <div className="cart-summary">
            <h3 className="cart-summary-title serif">Order Summary</h3>
            <div className="cart-summary-row">
              <span>Items ({itemCount})</span>
              <span>${Number(cart.total).toFixed(2)}</span>
            </div>
            <div className="cart-summary-row">
              <span>Delivery Charge</span>
              <span>Calculated after confirmation</span>
            </div>
            <div className="cart-summary-total">
              <span>Total</span>
              <span>${Number(cart.total).toFixed(2)}</span>
            </div>
            <button className="cart-checkout-btn" onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;
