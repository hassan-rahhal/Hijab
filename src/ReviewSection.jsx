import { useEffect, useState } from 'react';
import { API_BASE } from './lib/session.js';
import './ReviewSection.css';

function Stars({ rating, onSelect }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`star ${n <= rating ? 'filled' : ''} ${onSelect ? 'clickable' : ''}`}
          onClick={onSelect ? () => onSelect(n) : undefined}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function ReviewSection({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/reviews/${productId}`);
      const data = await res.json();
      setReviews(data.reviews);
      setAverage(data.average);
      setCount(data.count);
    } catch {
      // fail quietly, reviews just won't show
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [productId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || rating === 0) {
      setError('Please add your name and a star rating');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/reviews/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName: name, rating, comment }),
      });
      if (!res.ok) throw new Error('Failed to submit review');
      setName(''); setRating(0); setComment(''); setShowForm(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="review-section">
      <div className="review-section-head">
        <div>
          <h2 className="serif">Customer Reviews</h2>
          {count > 0 ? (
            <div className="review-summary">
              <Stars rating={Math.round(average)} />
              <span>{average} out of 5 ({count} review{count !== 1 ? 's' : ''})</span>
            </div>
          ) : (
            <p className="review-empty-note">No reviews yet — be the first.</p>
          )}
        </div>
        <button className="review-write-btn" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancel' : 'Write a Review'}
        </button>
      </div>

      {showForm && (
        <form className="review-form" onSubmit={handleSubmit}>
          <label className="review-field">
            <span>Your Name</span>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jane Doe" />
          </label>
          <label className="review-field">
            <span>Your Rating</span>
            <Stars rating={rating} onSelect={setRating} />
          </label>
          <label className="review-field">
            <span>Your Review (optional)</span>
            <textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience with this item…" />
          </label>
          {error && <p className="review-error">{error}</p>}
          <button type="submit" className="review-submit-btn" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit Review'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="review-empty-note">Loading reviews…</p>
      ) : (
        <div className="review-list">
          {reviews.map((r) => (
            <div key={r.id} className="review-item">
              <div className="review-item-head">
                <span className="review-item-name">{r.customer_name}</span>
                <Stars rating={r.rating} />
              </div>
              {r.comment && <p className="review-item-comment">{r.comment}</p>}
              <span className="review-item-date">{new Date(r.created_at).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReviewSection;
