import api from './api';

export const getWallet = () => api.get('/wallet').then((r) => r.data);
export const deposit = (payload) => api.post('/wallet/deposit', payload).then((r) => r.data);
export const withdraw = (payload) => api.post('/wallet/withdraw', payload).then((r) => r.data);
export const transfer = (payload) => api.post('/wallet/transfer', payload).then((r) => r.data);
