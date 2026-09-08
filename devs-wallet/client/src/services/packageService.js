import api from './api';

export const getPackages = () => api.get('/packages').then((r) => r.data);
export const getMyPurchases = () => api.get('/packages/my-purchases').then((r) => r.data);
export const purchasePackage = (payload) => api.post('/packages/purchase', payload).then((r) => r.data);
