import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { API_BASE } from './lib/session.js';
import './ShopPage.css';

const SORT_LABELS = {
  newest: 'Newest',
  'price-asc': 'Price: Low to High',
  'price-desc': 'Price: High to Low',
  'name-asc': 'Name: A–Z',
  'name-desc': 'Name: Z–A',
};

function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load categories once, for the filter pills
  useEffect(() => {
    fetch(`${API_BASE}/categories`)
      .then((res) => res.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  // Reload products whenever the category or sort changes
  useEffect(() => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (activeCategory !== 'all') params.set('category', activeCategory);
    params.set('sort', sort);

    fetch(`${API_BASE}/products?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error('Request failed');
        return res.json();
      })
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [activeCategory, sort]);

  return (
    <div className="shop-page">
      <div className="shop-top-links">
        <Link to="/" className="back-link">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6"><path d="M15 18l-6-6 6-6" /></svg>
          Back to Home
        </Link>
        <Link to="/cart" className="view-cart-link">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6">
            <path d="M6 8h12l-1 12H7L6 8z" />
            <path d="M9 8V6a3 3 0 0 1 6 0v2" />
          </svg>
          View Cart
        </Link>
      </div>

      <div className="shop-header">
        <div>
          <div className="shop-eyebrow">THE WARDROBE</div>
          <h1 className="shop-title serif">Shop All</h1>
        </div>

        <div className="shop-sort">
          <label htmlFor="sort-select">Sort by</label>
          <select
            id="sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="shop-filters">
        <button
          className={`filter-pill ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => { setActiveCategory('all'); setSearchParams({}); }}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`filter-pill ${activeCategory === cat.slug ? 'active' : ''}`}
            onClick={() => { setActiveCategory(cat.slug); setSearchParams({ category: cat.slug }); }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading && <p className="shop-status">Loading products…</p>}
      {error && <p className="shop-status">Could not load products: {error}</p>}
      {!loading && !error && products.length === 0 && (
        <p className="shop-status">No products found in this category yet.</p>
      )}

      <div className="product-grid">
        {products.map((p) => (
          <Link key={p.id} to={`/product/${p.slug}`} className="product-card">
            <div className="product-image">
              {p.image_url ? (
                <img src={p.image_url} alt={p.name} />
              ) : (
                <div className="product-image-fallback" />
              )}
              {!p.inStock && <span className="stock-tag">Sold out</span>}
              <span className="product-category-tag">{p.category_name}</span>
            </div>
            <div className="product-info">
              <span className="product-name serif">{p.name}</span>
              <span className="product-price">${Number(p.price).toFixed(2)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default ShopPage;
