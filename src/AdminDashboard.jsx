import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminFetch, isAdminLoggedIn, clearAdminToken } from './lib/adminSession.js';
import './AdminDashboard.css';

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL'];

function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('orders');

  useEffect(() => {
    if (!isAdminLoggedIn()) navigate('/portal-x7k9-login', { replace: true });
  }, [navigate]);

  function handleLogout() {
    clearAdminToken();
    navigate('/portal-x7k9-login');
  }

  if (!isAdminLoggedIn()) return null;

  return (
    <div className="admin-page">
      <div className="admin-topbar">
        <div className="admin-brand serif">Hijab Home — Admin</div>
        <button className="admin-logout-btn" onClick={handleLogout}>Log Out</button>
      </div>

      <div className="admin-tabs">
        {['orders', 'products', 'categories', 'reviews'].map((t) => (
          <button key={t} className={`admin-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {tab === 'orders' && <OrdersTab />}
        {tab === 'products' && <ProductsTab />}
        {tab === 'categories' && <CategoriesTab />}
        {tab === 'reviews' && <ReviewsTab />}
      </div>
    </div>
  );
}

/* ============================================================
   ORDERS TAB
   ============================================================ */
function buildWhatsAppMessage(order) {
  const itemLines = order.items
    .map((i) => `- ${i.product_name} (${i.size}${i.color && i.color !== 'Default' ? `, ${i.color}` : ''}) × ${i.quantity}`)
    .join('%0A');

  const grandTotal = Number(order.total) + Number(order.delivery_charge);

  const text =
    `Hi ${order.full_name}! Your Hijab Home order #${order.id} is confirmed.%0A%0A` +
    `${itemLines}%0A%0A` +
    `Items total: $${Number(order.total).toFixed(2)}%0A` +
    `Delivery charge: $${Number(order.delivery_charge).toFixed(2)}%0A` +
    `Grand total: $${grandTotal.toFixed(2)}%0A%0A` +
    `Thank you for shopping with us!`;

  const digitsOnly = (order.phone || '').replace(/[^\d]/g, '');
  return `https://wa.me/${digitsOnly}?text=${text}`;
}

function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  async function load() {
    setLoading(true);
    const res = await adminFetch('/admin/orders');
    if (res.ok) setOrders(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateOrder(id, patch) {
    setSavingId(id);
    await adminFetch(`/admin/orders/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
    await load();
    setSavingId(null);
  }

  async function deleteOrder(id) {
    if (!confirm(`Delete order #${id} permanently? This cannot be undone.`)) return;
    setSavingId(id);
    await adminFetch(`/admin/orders/${id}`, { method: 'DELETE' });
    await load();
    setSavingId(null);
  }

  if (loading) return <p className="admin-status">Loading orders…</p>;
  if (orders.length === 0) return <p className="admin-status">No orders yet.</p>;

  return (
    <div className="admin-orders-list">
      {orders.map((order) => (
        <div key={order.id} className="admin-order-card">
          <div className="admin-order-head">
            <div>
              <span className="admin-order-id">Order #{order.id}</span>
              <span className="admin-order-date">{new Date(order.created_at).toLocaleString()}</span>
            </div>
            <div className="admin-order-head-right">
              <span className={`admin-status-badge status-${order.status}`}>{order.status}</span>
              <button className="admin-delete-order-btn" onClick={() => deleteOrder(order.id)} disabled={savingId === order.id}>
                Delete
              </button>
            </div>
          </div>

          <div className="admin-order-body">
            <div className="admin-order-customer">
              <div><strong>{order.full_name}</strong></div>
              <div>{order.email}</div>
              <div>{order.phone}</div>
              <div>{order.address}, {order.city}</div>
              {order.notes && <div className="admin-order-notes">Note: {order.notes}</div>}
            </div>

            <div className="admin-order-items">
              {order.items.map((item) => (
                <div key={item.id} className="admin-order-item-line">
                  {item.product_name} ({item.size}{item.color && item.color !== 'Default' ? `, ${item.color}` : ''}) × {item.quantity} — ${Number(item.price * item.quantity).toFixed(2)}
                </div>
              ))}
            </div>
          </div>

          <div className="admin-order-controls">
            <label>
              <span>Status</span>
              <select value={order.status} onChange={(e) => updateOrder(order.id, { status: e.target.value })} disabled={savingId === order.id}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>

            <label>
              <span>Delivery Charge ($)</span>
              <input
                type="number"
                step="0.01"
                min="0"
                defaultValue={order.delivery_charge}
                onBlur={(e) => {
                  const val = Number(e.target.value);
                  if (val !== Number(order.delivery_charge)) updateOrder(order.id, { deliveryCharge: val });
                }}
                disabled={savingId === order.id}
              />
            </label>

            <div className="admin-order-total">
              <span>Items: ${Number(order.total).toFixed(2)}</span>
              <span>Grand Total: ${(Number(order.total) + Number(order.delivery_charge)).toFixed(2)}</span>
            </div>

            <a
              className="admin-whatsapp-btn"
              href={buildWhatsAppMessage(order)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Send WhatsApp Confirmation
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   PRODUCTS TAB
   ============================================================ */
function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  async function load() {
    setLoading(true);
    const [pRes, cRes] = await Promise.all([adminFetch('/admin/products'), adminFetch('/admin/categories')]);
    if (pRes.ok) setProducts(await pRes.json());
    if (cRes.ok) setCategories(await cRes.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function deleteProduct(id) {
    if (!confirm('Delete this product permanently?')) return;
    await adminFetch(`/admin/products/${id}`, { method: 'DELETE' });
    load();
  }

  if (loading) return <p className="admin-status">Loading products…</p>;

  if (editing) {
    return (
      <ProductForm
        product={editing === 'new' ? null : editing}
        categories={categories}
        onDone={() => { setEditing(null); load(); }}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <div>
      <button className="admin-add-btn" onClick={() => setEditing('new')}>+ Add Product</button>

      <div className="admin-product-table">
        {products.map((p) => {
          const sizesOk = p.sizes.length === 0 || p.sizes.some((s) => s.in_stock);
          const colorsOk = p.colors.length === 0 || p.colors.some((c) => c.in_stock);
          const inStock = sizesOk && colorsOk;

          return (
            <div key={p.id} className="admin-product-row">
              <div className="admin-product-thumb" style={{ backgroundImage: p.image_url ? `url(${p.image_url})` : 'none' }} />
              <div className="admin-product-info">
                <strong>{p.name}</strong>
                <span>{p.category_name} · ${Number(p.price).toFixed(2)} · {p.images?.length || 0} photo{p.images?.length === 1 ? '' : 's'}</span>
                {p.sizes.length > 0 && (
                  <span className="admin-pill-row">
                    {p.sizes.map((s) => (
                      <span key={s.size} className={`admin-mini-pill ${s.in_stock ? '' : 'out'}`}>{s.size}</span>
                    ))}
                  </span>
                )}
                {p.colors.length > 0 && (
                  <span className="admin-pill-row">
                    {p.colors.map((c) => (
                      <span key={c.name} className={`admin-mini-pill ${c.in_stock ? '' : 'out'}`}>{c.name}</span>
                    ))}
                  </span>
                )}
                <span className={inStock ? '' : 'out-of-stock-label'}>{inStock ? 'In Stock' : 'OUT OF STOCK'}</span>
              </div>
              <div className="admin-product-actions">
                <button onClick={() => setEditing(p)}>Edit</button>
                <button onClick={() => deleteProduct(p.id)} className="danger">Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProductForm({ product, categories, onDone, onCancel }) {
  const isNew = !product;
  const [name, setName] = useState(product?.name || '');
  const [categoryId, setCategoryId] = useState(product?.category_id || categories[0]?.id || '');
  const [price, setPrice] = useState(product?.price || '');
  const [description, setDescription] = useState(product?.description || '');
  const [images, setImages] = useState(product?.images || []);
  const [sizes, setSizes] = useState(
    product?.sizes?.length > 0
      ? product.sizes.map((s) => ({ size: s.size, inStock: !!s.in_stock }))
      : DEFAULT_SIZES.map((s) => ({ size: s, inStock: true }))
  );
  const [colors, setColors] = useState(
    product?.colors?.map((c) => ({ name: c.name, hex: c.hex || '#000000', inStock: !!c.in_stock })) || []
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function toggleSizeStock(index) {
    setSizes((s) => s.map((row, i) => i === index ? { ...row, inStock: !row.inStock } : row));
  }
  function updateSizeName(index, value) {
    setSizes((s) => s.map((row, i) => i === index ? { ...row, size: value } : row));
  }
  function addSizeRow() { setSizes((s) => [...s, { size: '', inStock: true }]); }
  function removeSizeRow(index) { setSizes((s) => s.filter((_, i) => i !== index)); }

  function toggleColorStock(index) {
    setColors((c) => c.map((row, i) => i === index ? { ...row, inStock: !row.inStock } : row));
  }
  function updateColorName(index, value) {
    setColors((c) => c.map((row, i) => i === index ? { ...row, name: value } : row));
  }
  function updateColorHex(index, value) {
    setColors((c) => c.map((row, i) => i === index ? { ...row, hex: value } : row));
  }
  function addColorRow() { setColors((c) => [...c, { name: '', hex: '#000000', inStock: true }]); }
  function removeColorRow(index) { setColors((c) => c.filter((_, i) => i !== index)); }

  async function handlePhotoUpload(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    setError('');
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);
        const res = await adminFetch('/admin/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed');
        uploadedUrls.push(data.url);
      }
      setImages((imgs) => [...imgs, ...uploadedUrls]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  function removeImage(index) {
    setImages((imgs) => imgs.filter((_, i) => i !== index));
  }
  function makeCover(index) {
    setImages((imgs) => [imgs[index], ...imgs.filter((_, i) => i !== index)]);
  }

  async function handleSave() {
    if (!name.trim() || !categoryId || !price) {
      setError('Name, category, and price are required');
      return;
    }
    setSaving(true);
    setError('');

    const cleanSizes = sizes.filter((s) => s.size.trim());
    const cleanColors = colors.filter((c) => c.name.trim());

    const payload = {
      name,
      categoryId: Number(categoryId),
      price: Number(price),
      description,
      imageUrl: images[0] || null,
      sizes: cleanSizes,
      colors: cleanColors,
      images,
    };

    const res = isNew
      ? await adminFetch('/admin/products', { method: 'POST', body: JSON.stringify(payload) })
      : await adminFetch(`/admin/products/${product.id}`, { method: 'PUT', body: JSON.stringify(payload) });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Failed to save product');
      setSaving(false);
      return;
    }
    onDone();
  }

  return (
    <div className="admin-form-card">
      <h3 className="serif">{isNew ? 'Add Product' : `Edit: ${product.name}`}</h3>

      <label className="admin-field">
        <span>Name</span>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </label>

      <label className="admin-field">
        <span>Category</span>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </label>

      <label className="admin-field">
        <span>Price ($)</span>
        <input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} />
      </label>

      <label className="admin-field">
        <span>Description</span>
        <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>

      <div className="admin-field">
        <span>Photos</span>
        <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} />
        {uploading && <span className="admin-hint">Uploading…</span>}
        {images.length > 0 && (
          <div className="admin-photo-grid">
            {images.map((img, i) => (
              <div key={i} className={`admin-photo-item ${i === 0 ? 'cover' : ''}`}>
                <img src={img} alt={`Photo ${i + 1}`} />
                {i === 0 && <span className="admin-cover-tag">Cover</span>}
                <div className="admin-photo-actions">
                  {i !== 0 && <button type="button" onClick={() => makeCover(i)}>Set as cover</button>}
                  <button type="button" onClick={() => removeImage(i)} className="danger">Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="admin-hint">You can select multiple photos at once. The first photo (or whichever you set as cover) is used as the main thumbnail across the site.</p>
      </div>

      <div className="admin-sizes-section">
        <span className="admin-sizes-label">Sizes</span>
        {sizes.map((row, i) => (
          <div key={i} className="admin-size-row">
            <input
              type="text"
              placeholder="Size (e.g. M, One Size)"
              value={row.size}
              onChange={(e) => updateSizeName(i, e.target.value)}
            />
            <button
              type="button"
              className={`admin-toggle-btn ${row.inStock ? 'in' : 'out'}`}
              onClick={() => toggleSizeStock(i)}
            >
              {row.inStock ? 'In Stock' : 'Out of Stock'}
            </button>
            <button type="button" onClick={() => removeSizeRow(i)} className="admin-remove-size-btn">×</button>
          </div>
        ))}
        <button type="button" className="admin-add-size-btn" onClick={addSizeRow}>+ Add Size</button>
      </div>

      <div className="admin-sizes-section">
        <span className="admin-sizes-label">Colors</span>
        {colors.map((row, i) => (
          <div key={i} className="admin-size-row">
            <input
              type="color"
              value={row.hex}
              onChange={(e) => updateColorHex(i, e.target.value)}
              className="admin-color-input"
            />
            <input
              type="text"
              placeholder="Color name (e.g. Black)"
              value={row.name}
              onChange={(e) => updateColorName(i, e.target.value)}
            />
            <button
              type="button"
              className={`admin-toggle-btn ${row.inStock ? 'in' : 'out'}`}
              onClick={() => toggleColorStock(i)}
            >
              {row.inStock ? 'In Stock' : 'Out of Stock'}
            </button>
            <button type="button" onClick={() => removeColorRow(i)} className="admin-remove-size-btn">×</button>
          </div>
        ))}
        <button type="button" className="admin-add-size-btn" onClick={addColorRow}>+ Add Color</button>
        <p className="admin-hint">Colors are optional — leave empty if this item doesn't come in different colors. When every size AND every color is marked "Out of Stock", the item shows as sold out on the shop.</p>
      </div>

      {error && <p className="admin-form-error">{error}</p>}

      <div className="admin-form-actions">
        <button className="admin-save-btn" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Product'}
        </button>
        <button className="admin-cancel-btn" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

/* ============================================================
   CATEGORIES TAB
   ============================================================ */
function CategoriesTab() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  async function load() {
    setLoading(true);
    const res = await adminFetch('/admin/categories');
    if (res.ok) setCategories(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function addCategory() {
    if (!newName.trim()) return;
    const res = await adminFetch('/admin/categories', { method: 'POST', body: JSON.stringify({ name: newName, sortOrder: categories.length + 1 }) });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || 'Failed to add category');
      return;
    }
    setNewName('');
    load();
  }

  async function saveEdit(id) {
    if (!editingName.trim()) return;
    await adminFetch(`/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify({ name: editingName }) });
    setEditingId(null);
    load();
  }

  async function deleteCategory(id) {
    if (!confirm('Delete this category? This only works if no products use it.')) return;
    const res = await adminFetch(`/admin/categories/${id}`, { method: 'DELETE' });
    if (!res.ok) { const data = await res.json(); alert(data.error); }
    load();
  }

  if (loading) return <p className="admin-status">Loading categories…</p>;

  return (
    <div className="admin-categories">
      <div className="admin-add-category-row">
        <input type="text" placeholder="New category name" value={newName} onChange={(e) => setNewName(e.target.value)} />
        <button onClick={addCategory}>+ Add Category</button>
      </div>

      <div className="admin-category-list">
        {categories.map((c) => (
          <div key={c.id} className="admin-category-row">
            {editingId === c.id ? (
              <>
                <input type="text" value={editingName} onChange={(e) => setEditingName(e.target.value)} />
                <button onClick={() => saveEdit(c.id)}>Save</button>
                <button onClick={() => setEditingId(null)}>Cancel</button>
              </>
            ) : (
              <>
                <span>{c.name}</span>
                <span className="admin-category-slug">/{c.slug}</span>
                <button onClick={() => { setEditingId(c.id); setEditingName(c.name); }}>Edit</button>
                <button onClick={() => deleteCategory(c.id)} className="danger">Delete</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   REVIEWS TAB
   ============================================================ */
function ReviewsTab() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  async function load() {
    setLoading(true);
    const res = await adminFetch('/admin/reviews');
    if (res.ok) setReviews(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function deleteReview(id) {
    if (!confirm('Delete this review permanently?')) return;
    setDeletingId(id);
    await adminFetch(`/admin/reviews/${id}`, { method: 'DELETE' });
    await load();
    setDeletingId(null);
  }

  if (loading) return <p className="admin-status">Loading reviews…</p>;
  if (reviews.length === 0) return <p className="admin-status">No reviews yet.</p>;

  return (
    <div className="admin-reviews-list">
      {reviews.map((r) => (
        <div key={r.id} className="admin-review-card">
          <div className="admin-review-head">
            <div>
              <strong>{r.customer_name}</strong>
              <span className="admin-review-product"> on {r.product_name}</span>
            </div>
            <div className="admin-review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
          </div>
          {r.comment && <p className="admin-review-comment">{r.comment}</p>}
          <div className="admin-review-footer">
            <span className="admin-review-date">{new Date(r.created_at).toLocaleDateString()}</span>
            <button className="admin-delete-review-btn" onClick={() => deleteReview(r.id)} disabled={deletingId === r.id}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AdminDashboard;
