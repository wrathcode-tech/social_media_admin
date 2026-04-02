

// Betting backend base URL. Use REACT_APP_BETTING_API_URL (or VITE_API_URL in Vite). Doc: BASE_URL/api/v1.
const bettingUrl = process.env.REACT_APP_BETTING_API_URL || process.env.VITE_API_URL || "http://192.168.1.5:5173";




export const deployedUrl = `${window.origin}/`;

const API_V1_ADMIN_AUTH = `${bettingUrl}/api/v1/admin/auth/`;
const API_V1_ADMIN_DASHBOARD = `${bettingUrl}/api/v1/admin/`;
const API_V1_ADMIN_POSTS = `${bettingUrl}/api/v1/admin/content/`;

export const ApiConfig = {
  adminLogin: 'login',
  dashboard: 'dashboard',
  userList: 'users',
  postsList: 'posts',
  reelsList: 'reels',

  baseAdminAuth: API_V1_ADMIN_AUTH,
  baseAdminDashboard: API_V1_ADMIN_DASHBOARD,
  baseAdminPosts: API_V1_ADMIN_POSTS,





};
