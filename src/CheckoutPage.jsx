import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE, getSessionId } from './lib/session.js';
import './CheckoutPage.css';

const EMPTY_FORM = { fullName: '', email: '', phone: '', address: '', city: '', notes: '' };

function CheckoutPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loadingCart, setLoadingCart] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [confirmation, setConfirmation] = useState(null); // { orderId, total }

  useEffect(() => {
    fetch(`${API_BASE}/cart/${getSessionId()}`)
      .then((res) => res.json())
      .then(setCart)
      .catch(() => {})
      .finally(() => setLoadingCart(false));
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((errs) => ({ ...errs, [name]: undefined }));
  }

  function validate() {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = 'Enter a valid email address';
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    else if (!/^[\d+\-\s()]{7,}$/.test(form.phone.trim())) errs.phone = 'Enter a valid phone number';
    if (!form.address.trim()) errs.address = 'Address is required';
    if (!form.city.trim()) errs.city = 'City is required';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: getSessionId(), ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place order');
      setConfirmation(data);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmation) {
    return (
      <div className="checkout-page">
        <div className="order-confirmation">
          <div className="order-confirmation-icon">✓</div>
          <h1 className="serif">Order Placed</h1>
          <p>Thank you, {form.fullName.split(' ')[0]} — your order has been received.</p>
          <div className="order-confirmation-details">
            <div><span>Order Number</span><span>#{confirmation.orderId}</span></div>
            <div><span>Total</span><span>${Number(confirmation.total).toFixed(2)}</span></div>
            <div><span>Delivering to</span><span>{form.address}, {form.city}</span></div>
          </div>
          <p className="checkout-delivery-note">
            This total excludes delivery charge — we'll reach out to confirm the delivery fee for your order shortly.
          </p>
          <Link to="/shop" className="checkout-submit-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (!loadingCart && cart.items.length === 0) {
    return (
      <div className="checkout-page">
        <p className="checkout-status">
          Your cart is empty. <Link to="/shop">Go shopping →</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <Link to="/cart" className="back-link">
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6"><path d="M15 18l-6-6 6-6" /></svg>
        Back to Cart
      </Link>

      <div className="checkout-header">
        <div className="checkout-eyebrow">ALMOST THERE</div>
        <h1 className="checkout-title serif">Checkout</h1>
      </div>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit} noValidate>
          <h3 className="serif">Delivery Details</h3>

          <label className="field">
            <span>Full Name</span>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="e.g. John Doe"
            />
            {errors.fullName && <span className="field-error">{errors.fullName}</span>}
          </label>

          <label className="field">
            <span>Email Address</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="e.g. john.doe@email.com"
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </label>

          <label className="field">
            <span>Phone Number</span>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="e.g. +961 71 234 567"
            />
            {errors.phone && <span className="field-error">{errors.phone}</span>}
          </label>

          <label className="field">
            <span>Address</span>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Street, building, floor"
            />
            {errors.address && <span className="field-error">{errors.address}</span>}
          </label>

          <label className="field">
            <span>City</span>
            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="e.g. Baabda"
            />
            {errors.city && <span className="field-error">{errors.city}</span>}
          </label>

          <label className="field">
            <span>Order Notes (optional)</span>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Delivery instructions, landmark, preferred time…"
              rows={3}
            />
          </label>

          {submitError && <p className="field-error submit-error">{submitError}</p>}

          <button type="submit" className="checkout-submit-btn" disabled={submitting}>
            {submitting ? 'Placing Order…' : 'Place Order'}
          </button>
        </form>

        <div className="checkout-summary">
          <h3 className="serif">Order Summary</h3>
          {loadingCart ? (
            <p className="checkout-status">Loading…</p>
          ) : (
            <>
              <div className="checkout-summary-items">
                {cart.items.map((item) => (
                  <div key={`${item.product_id}-${item.size}-${item.color}`} className="checkout-summary-line">
                    <span>
                      {item.name} <span className="dim">× {item.quantity}</span>{' '}
                      <span className="dim">
                        ({item.size}{item.color && item.color !== 'Default' ? `, ${item.color}` : ''})
                      </span>
                    </span>
                    <span>${(Number(item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="checkout-summary-total">
                <span>Total</span>
                <span>${Number(cart.total).toFixed(2)}</span>
              </div>
              <p className="checkout-delivery-note">
                Excludes delivery charge — we'll confirm your delivery fee after your order is reviewed.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
