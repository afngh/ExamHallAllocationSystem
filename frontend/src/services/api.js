// src/services/api.js
// Uses relative /api path so Vite's proxy forwards to backend.
// This avoids all CORS issues during development.

// CRA proxy: set "proxy": "http://localhost:5000" in frontend/package.json
const BASE = '/api';

async function request(method, path, body) {
  const token = sessionStorage.getItem('exam_token');

  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `HTTP ${res.status}`);
  }

  return res.json();
}

const get  = (path)       => request('GET',    path);
const post = (path, body) => request('POST',   path, body);
const put  = (path, body) => request('PUT',    path, body);
const del  = (path)       => request('DELETE', path);

// ── Auth ──────────────────────────────────────────────────────
export const authApi = {
  login: (role, username, password) =>
    post('/auth/login', { role, username, password }),
};

// ── Students ──────────────────────────────────────────────────
export const studentsApi = {
  list:        ()             => get('/students'),
  bulkCreate:  (students)     => post('/students/bulk', { students }),
  update:      (id, data)     => put(`/students/${id}`, data),
  remove:      (id)           => del(`/students/${id}`),
  deleteClass: (branch, year) => del(`/students/class/${encodeURIComponent(branch)}/${year}`),
};

// ── Halls ─────────────────────────────────────────────────────
export const hallsApi = {
  list:   ()         => get('/halls'),
  create: (hall)     => post('/halls', hall),
  update: (id, data) => put(`/halls/${id}`, data),
  remove: (id)       => del(`/halls/${id}`),
};

// ── Staff ─────────────────────────────────────────────────────
export const staffApi = {
  list:   ()       => get('/staff'),
  create: (data)   => post('/staff', data),
  remove: (id)     => del(`/staff/${id}`),
};

// ── Developer panel ───────────────────────────────────────────
export const developerApi = {
  listAdmins:  (page = 1) => get(`/developer/admins?page=${page}`),
  createAdmin: (data)     => post('/developer/admins', data),
  updateAdmin: (id, data) => put(`/developer/admins/${id}`, data),
  deleteAdmin: (id)       => del(`/developer/admins/${id}`),
};
