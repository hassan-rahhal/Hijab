import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE } from './lib/session.js';
import { setAdminToken, isAdminLoggedIn } from './lib/adminSession.js';
import './AdminLogin.css';

function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAdminLoggedIn()) {
    navigate('/portal-x7k9', { replace: true });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      setAdminToken(data.token);
      navigate('/portal-x7k9');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-login-page">
      <form className="admin-login-box" onSubmit={handleSubmit}>
        <Link to="/" className="admin-back-link">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6"><path d="M15 18l-6-6 6-6" /></svg>
          Back
        </Link>

        <div className="admin-login-brand serif">Hijab Home</div>
        <div className="admin-login-sub">Admin Access</div>

        <label className="admin-field">
          <span>Username</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
          />
        </label>

        <label className="admin-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && <p className="admin-login-error">{error}</p>}

        <button type="submit" className="admin-login-btn" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}

export default AdminLogin;
