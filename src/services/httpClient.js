import axios from 'axios';

const base = (process.env.REACT_APP_BACKEND_URL || '').replace(/\/$/, '');
const TOKEN_KEY = 'gtbs_admin_jwt';

export const httpClient = axios.create({
  baseURL: base || undefined,
  headers: { 'Content-Type': 'application/json' },
});

httpClient.interceptors.request.use((config) => {
  const t = sessionStorage.getItem(TOKEN_KEY);
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

httpClient.interceptors.response.use(
  (r) => r,
  (err) => {
    const msg = err.response?.data?.error || err.message || 'Request failed';
    return Promise.reject(new Error(msg));
  }
);

export function getBackendBase() {
  return base;
}

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.removeItem(TOKEN_KEY);
}

export async function loginAdmin(email, password) {
  const { data } = await httpClient.post('/admin/auth/login', { email, password });
  return data;
}

/** @param {string} path */
export async function getJson(path, config) {
  const { data } = await httpClient.get(path, config);
  return data;
}

/** @param {string} path */
export async function postJson(path, body, config) {
  const { data } = await httpClient.post(path, body, config);
  return data;
}

/** @param {string} path */
export async function patchJson(path, body, config) {
  const { data } = await httpClient.patch(path, body, config);
  return data;
}

/** @param {string} path */
export async function putJson(path, body, config) {
  const { data } = await httpClient.put(path, body, config);
  return data;
}

/** @param {string} path */
export async function deleteJson(path, config) {
  const { data } = await httpClient.delete(path, config);
  return data;
}
