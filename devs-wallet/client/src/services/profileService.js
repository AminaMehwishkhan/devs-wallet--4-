import api from './api';

export const updateProfile = (payload) => api.put('/profile', payload).then((r) => r.data);
export const changePassword = (payload) => api.put('/profile/password', payload).then((r) => r.data);
export const uploadAvatar = (formData) =>
  api.post('/profile/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
