import api from './api';

export const getTransactions = (params) => api.get('/transactions', { params }).then((r) => r.data);
export const getDashboardStats = () => api.get('/transactions/dashboard-stats').then((r) => r.data);
