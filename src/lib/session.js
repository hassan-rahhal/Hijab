export const API_BASE = 'https://hijab-gb5l-eight.vercel.app/api';

// A random ID that identifies THIS BROWSER's cart to the database.
// It's just a pointer stored in localStorage — the actual cart lives in MySQL.
export function getSessionId() {
  let sessionId = localStorage.getItem('hijabhome_session');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('hijabhome_session', sessionId);
  }
  return sessionId;
}
