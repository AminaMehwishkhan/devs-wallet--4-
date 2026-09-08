import api from './api';

export const register = (payload) => api.post('/auth/register', payload).then((r) => r.data);
export const login = (payload) => api.post('/auth/login', payload).then((r) => r.data);
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email }).then((r) => r.data);
export const resetPassword = (payload) => api.post('/auth/reset-password', payload).then((r) => r.data);
export const getMe = () => api.get('/auth/me').then((r) => r.data);
