import api from './api';

export const getBeneficiaries = () => api.get('/beneficiaries').then((r) => r.data);
export const addBeneficiary = (payload) => api.post('/beneficiaries', payload).then((r) => r.data);
export const updateBeneficiary = (id, payload) => api.put(`/beneficiaries/${id}`, payload).then((r) => r.data);
export const deleteBeneficiary = (id) => api.delete(`/beneficiaries/${id}`).then((r) => r.data);
