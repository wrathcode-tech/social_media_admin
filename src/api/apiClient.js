import axios from 'axios';

const baseURL = (process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BETTING_API_URL || '').replace(/\/$/, '');

export const apiClient = axios.create({
  baseURL: baseURL || undefined,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (r) => r,
  (err) => {
    const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Request failed';
    return Promise.reject(new Error(msg));
  }
);

export async function getJson(path, config) {
  const { data } = await apiClient.get(path, config);
  return data;
}

export async function postJson(path, body, config) {
  const { data } = await apiClient.post(path, body, config);
  return data;
}

export async function patchJson(path, body, config) {
  const { data } = await apiClient.patch(path, body, config);
  return data;
}
