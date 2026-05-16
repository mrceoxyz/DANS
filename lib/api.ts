import axios from 'axios';

const API_BASE_URL = 'https://dans-backend.onrender.com';
// const API_BASE_URL = 'http://127.0.0.1:8000/';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('Token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (username: string, password: string) => 
    api.post('/api/auth/login/', { username, password }),
  register: (data: any) => api.post('/api/auth/register/', data),
  logout: () => api.post('/api/auth/logout/'),
};

export const userAPI = {
  getCurrentUser: () => api.get('/api/auth/me/'),
  deleteUser: (id: number) => api.delete(`/api/auth/users/${id}/delete/`),
  getUsers: () => api.get('/api/users/'),
  updateProfile: (id: number, data: any) => 
    axios.put(`${API_BASE_URL.replace('/api', '/api')}/admin/auth/user/${id}/`, data, {
      headers: {
        'Authorization': `Token ${localStorage.getItem('Token')}`,
        'Content-Type': 'application/json',
      }
    }),
};

export const roleAPI = {
  getAll: () => api.get('/api/roles/'),
  getOne: (id: number) => api.get(`/api/roles/${id}/`),
};

export const profileAPI = {
  getAll: () => api.get('/api/profiles/'),
  getMe: () => api.get('/api/profiles/me/'),
  assignRole: (id: number, role_id: number) => 
    api.post(`/api/profiles/${id}/assign_role/`, { role_id }),
};

export const userActivity = {
  getUserActivity: () => api.get('/api/activities/'),
};

export const subscriptionAPI = {
  getCurrent: () => api.get('/api/subscriptions/'),
  upgrade: (plan: string) => api.post('/api/subscriptions/upgrade/', { plan }),
  cancel: () => api.post('/api/subscriptions/cancel/'),
  checkLimits: () => api.get('/api/subscriptions/check_limits/'),
};

export const customerAPI = {
  getAll: () => api.get('/api/customers/'),
  getOne: (id: number) => api.get(`/api/customers/${id}/`),
  create: (data: any) => api.post('/api/customers/', data),
  update: (id: number, data: any) => api.put(`/api/customers/${id}/`, data),
  delete: (id: number) => api.delete(`/api/customers/${id}/`),
  getOrders: (id: number) => api.get(`/api/customers/${id}/orders/`),
};

export const measurementAPI = {
  getAll: () => api.get('/api/measurements/'),
  getOne: (id: number) => api.get(`/api/measurements/${id}/`),
  create: (data: any) => api.post('/api/measurements/', data),
  update: (id: number, data: any) => api.put(`/api/measurements/${id}/`, data),
  delete: (id: number) => api.delete(`/api/measurements/${id}/`),
};

export const fabricAPI = {
  getAll: () => api.get('/api/fabrics/'),
  create: (data: any) => api.post('/api/fabrics/', data),
  update: (id: number, data: any) => api.put(`/api/fabrics/${id}/`, data),
  delete: (id: number) => api.delete(`/api/fabrics/${id}/`),
  getLowStock: () => api.get('/api/fabrics/low_stock/'),
};

export const orderAPI = {
  getAll: (status?: string) => api.get('/api/orders/', { params: { status } }),
  getOne: (id: number) => api.get(`/api/orders/${id}/`),
  create: (data: any) => api.post('/api/orders/', data),
  update: (id: number, data: any) => api.put(`/api/orders/${id}/`, data),
  updateStatus: (id: number, status: string) => 
    api.post(`/api/orders/${id}/update_status/`, { status }),
  delete: (id: number) => api.delete(`/orders/${id}/`),
};

export const paymentAPI = {
  getAll: () => api.get('/api/payments/'),
  create: (data: any) => api.post('/api/payments/', data),
  delete: (id: number) => api.delete(`/api/payments/${id}/`),
};

export const financialsAPI = {
  getAll: () => api.get('/api/financials/'),
  create: (data: any) => api.post('/api/financials/', data),
  update: (id: number, data: any) => api.put(`/api/financials/${id}/`, data),
};

export const dashboardAPI = {
  getStats: () => api.get('/api/dashboard/stats/'),
};

export default api;