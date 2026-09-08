import api from './api';

export const getUsers = (params) => api.get('/admin/users', { params }).then((r) => r.data);
export const updateUserStatus = (id, status) =>
  api.put(`/admin/users/${id}/status`, { status }).then((r) => r.data);
export const getAllTransactions = (params) => api.get('/admin/transactions', { params }).then((r) => r.data);
export const getReports = () => api.get('/admin/reports').then((r) => r.data);
