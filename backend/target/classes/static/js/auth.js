/* ═══════════════════════════════════════════
   NESAMANI — auth.js
   Roles: "needer" | "provider"
   Load BEFORE api.js and any dashboard JS.
   ═══════════════════════════════════════════ */

const API_BASE = '';

const SESSION_KEYS = {
  token:  'nesaToken',
  role:   'nesaRole',
  name:   'nesaName',
  userId: 'nesaUserId',
  email:  'nesaEmail',
  phone:  'nesaPhone'
};

/* Save session after login
   Normalises role to lowercase */
function saveSession(data) {
  try {
    localStorage.setItem(SESSION_KEYS.token,  data.token                        || '');
    localStorage.setItem(SESSION_KEYS.role,   (data.role || '').toLowerCase()   || '');
    localStorage.setItem(SESSION_KEYS.name,   data.name                         || '');
    localStorage.setItem(SESSION_KEYS.userId, data.userId || data.id            || '');
    localStorage.setItem(SESSION_KEYS.email,  data.email                        || '');
    localStorage.setItem(SESSION_KEYS.phone,  data.phone                        || '');
  } catch (e) { console.error('[auth] saveSession failed:', e); }
}

/* Read a session value */
function getSession(key) {
  try { return localStorage.getItem(SESSION_KEYS[key]) || ''; }
  catch (e) { return ''; }
}

/* Clear all session data */
function clearSession() {
  try { Object.values(SESSION_KEYS).forEach(k => localStorage.removeItem(k)); }
  catch (e) { /* silent */ }
}

/* Redirect based on role */
function redirectByRole(role) {
  const r = (role || '').toLowerCase();
  if (r === 'needer') {
    window.location.href = 'needer-dashboard.html';
  } else if (r === 'provider') {
    window.location.href = 'provider-dashboard.html';
  } else {
    window.location.href = 'login.html';
  }
}

/* Auth guard */
function requireAuth(expectedRole) {
  const token = getSession('token');
  const role  = getSession('role');
  if (!token) { window.location.href = 'login.html'; return false; }
  if (expectedRole && role !== expectedRole.toLowerCase()) {
    redirectByRole(role); return false;
  }
  return true;
}

/* Build auth headers for fetch */
function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + getSession('token')
  };
}

/* Authenticated fetch wrapper */
async function apiFetch(path, options = {}) {
  const headers = Object.assign({}, authHeaders(), options.headers || {});
  try {
    const res = await fetch(path, { ...options, headers });
    if (res.status === 401) {
      clearSession();
      window.location.href = 'login.html';
      throw new Error('Session expired.');
    }
    return res;
  } catch (err) {
    if (err.message === 'Session expired.') throw err;
    throw err;
  }
}

/* Logout */
function logout() {
  clearSession();
  window.location.href = 'login.html';
}
