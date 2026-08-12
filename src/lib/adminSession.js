import { API_BASE } from './session.js';

export function getAdminToken() {
  return localStorage.getItem('hijabhome_admin_token');
}

export function setAdminToken(token) {
  localStorage.setItem('hijabhome_admin_token', token);
}

export function clearAdminToken() {
  localStorage.removeItem('hijabhome_admin_token');
}

export function isAdminLoggedIn() {
  return !!getAdminToken();
}

// fetch wrapper that automatically attaches the admin's Authorization header
export async function adminFetch(path, options = {}) {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (res.status === 401) {
    clearAdminToken();
    window.location.href = '/portal-x7k9-login';
  }

  return res;
}
