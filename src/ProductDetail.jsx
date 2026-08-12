import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_BASE, getSessionId } from './lib/session.js';
import ReviewSection from './ReviewSection.jsx';
import './ProductDetail.css';

const CATEGORY_SWATCH = {
  Abaya:       'linear-gradient(135deg,#8a9457,#5c6a2f 60%,#3f491f)',
  Echarpe:     'linear-gradient(135deg,#c9bd94,#9aa066 60%,#68713a)',
  Sets:        'linear-gradient(135deg,#7c8a49,#4f5a24 60%,#333c17)',
  Accessories: 'linear-gradient(135deg,#b0a26f,#8a9457 60%,#5c6a2f)',
};

function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState(null);
  const [color, setColor] = useState(null);
  const [selectionError, setSelectionError] = useState('');
  const [addStatus, setAddStatus] = useState('');

  useEffect(() => {
    setLoading(true);
    setError(null);
    setActiveImage(0);
    setQuantity(1);
    setSize(null);
    setColor(null);
    setSelectionError('');
    setAddStatus('');

    fetch(`${API_BASE}/products/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 404 ? 'Product not found' : 'Request failed');
        return res.json();
      })
      .then(setProduct)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  async function handleAddToCart() {
    if (!product || !product.inStock) return;
    if (product.sizes.length > 0 && !size) return setSelectionError('Please select a size');
    if (product.colors.length > 0 && !color) return setSelectionError('Please select a color');

    setAddStatus('adding');
    try {
      await fetch(`${API_BASE}/cart/${getSessionId()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          size: size || 'One Size',
          color: color || 'Default',
          quantity,
        }),
      });
      setAddStatus('added');
      setTimeout(() => setAddStatus(''), 2000);
    } catch {
      setAddStatus('');
    }
  }

  if (loading) return <div className="pd-page"><p className="pd-status">Loading product…</p></div>;

  if (error || !product) {
    return (
      <div className="pd-page">
        <Link to="/shop" className="back-link">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6"><path d="M15 18l-6-6 6-6" /></svg>
          Back to Shop
        </Link>
        <p className="pd-status">{error || 'Product not found.'}</p>
      </div>
    );
  }

  const fallbackBg = CATEGORY_SWATCH[product.category_name] || CATEGORY_SWATCH.Abaya;
  const hasPhotos = product.images && product.images.length > 0;
  const mainImage = hasPhotos ? product.images[activeImage] : null;

  return (
    <div className="pd-page">
      <div className="pd-top-links">
        <Link to="/shop" className="back-link">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6"><path d="M15 18l-6-6 6-6" /></svg>
          Back to Shop
        </Link>
        <Link to="/cart" className="view-cart-link">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6">
            <path d="M6 8h12l-1 12H7L6 8z" />
            <path d="M9 8V6a3 3 0 0 1 6 0v2" />
          </svg>
          View Cart
        </Link>
      </div>

      <div className="pd-layout">
        <div className="pd-gallery">
          <div
            className="pd-image"
            style={{ background: mainImage ? `url('${mainImage}') center/cover` : fallbackBg }}
          >
            <span className="pd-category-tag">{product.category_name}</span>
            {!product.inStock && <span className="pd-stock-tag">Sold out</span>}
          </div>

          {hasPhotos && product.images.length > 1 && (
            <div className="pd-thumbs">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  className={`pd-thumb ${i === activeImage ? 'active' : ''}`}
                  style={{ background: `url('${img}') center/cover` }}
                  onClick={() => setActiveImage(i)}
                  aria-label={`View photo ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="pd-info">
          <div className="pd-eyebrow">{product.category_name}</div>
          <h1 className="pd-name serif">{product.name}</h1>
          <div className="pd-price">
            ${(Number(product.price) * quantity).toFixed(2)}
            {quantity > 1 && (
              <span className="pd-price-unit">(${Number(product.price).toFixed(2)} × {quantity})</span>
            )}
          </div>

          <p className="pd-description">
            {product.description || 'No description has been added for this item yet.'}
          </p>

          <div className="pd-meta">
            <div className="pd-meta-row">
              <span className="pd-meta-label">Availability</span>
              <span className={`pd-meta-value ${product.inStock ? 'in-stock' : 'out-stock'}`}>
                {product.inStock ? 'In Stock' : 'Sold Out'}
              </span>
            </div>
            <div className="pd-meta-row">
              <span className="pd-meta-label">Date posted</span>
              <span className="pd-meta-value">{formatDate(product.created_at)}</span>
            </div>
            <div className="pd-meta-row">
              <span className="pd-meta-label">Product ID</span>
              <span className="pd-meta-value">#{product.id}</span>
            </div>
          </div>

          {product.colors.length > 0 && (
            <div className="pd-size-row">
              <div className="pd-size-head">
                <span className="pd-meta-label">Color</span>
              </div>
              <div className="pd-size-options">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    className={`pd-color-btn ${color === c.name ? 'active' : ''} ${!c.inStock ? 'disabled' : ''}`}
                    disabled={!c.inStock}
                    onClick={() => { setColor(c.name); setSelectionError(''); }}
                    title={!c.inStock ? `${c.name} — Out of stock` : c.name}
                  >
                    {c.hex && <span className="pd-color-swatch" style={{ background: c.hex }} />}
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.sizes.length > 0 && (
            <div className="pd-size-row">
              <div className="pd-size-head">
                <span className="pd-meta-label">Size</span>
              </div>
              <div className="pd-size-options">
                {product.sizes.map((s) => (
                  <button
                    key={s.size}
                    type="button"
                    className={`pd-size-btn ${size === s.size ? 'active' : ''} ${!s.inStock ? 'disabled' : ''}`}
                    disabled={!s.inStock}
                    onClick={() => { setSize(s.size); setSelectionError(''); }}
                    title={!s.inStock ? 'Out of stock' : s.size}
                  >
                    {s.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectionError && <p className="pd-size-error">{selectionError}</p>}

          {product.inStock && (
            <div className="pd-qty-row">
              <span className="pd-meta-label">Quantity</span>
              <div className="pd-qty-control">
                <button className="qty-btn" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
                <span className="qty-val">{quantity}</span>
                <button className="qty-btn" onClick={() => setQuantity((q) => Math.min(20, q + 1))} aria-label="Increase quantity">+</button>
              </div>
            </div>
          )}

          <button
            className="pd-add-btn"
            onClick={handleAddToCart}
            disabled={!product.inStock || addStatus === 'adding'}
          >
            {!product.inStock ? 'Unavailable' : addStatus === 'added' ? 'Added to Cart ✓' : addStatus === 'adding' ? 'Adding…' : 'Add to Cart'}
          </button>
        </div>
      </div>

      <ReviewSection productId={product.id} />
    </div>
  );
}

export default ProductDetail;
