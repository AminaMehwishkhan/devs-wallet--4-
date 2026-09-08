import api from './api';

export const getBills = () => api.get('/bills').then((r) => r.data);
export const payBill = (payload) => api.post('/bills/pay', payload).then((r) => r.data);
