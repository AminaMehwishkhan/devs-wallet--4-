import api from './api';

export const getGoals = () => api.get('/savings-goals').then((r) => r.data);
export const createGoal = (payload) => api.post('/savings-goals', payload).then((r) => r.data);
export const updateGoal = (id, payload) => api.put(`/savings-goals/${id}`, payload).then((r) => r.data);
export const deleteGoal = (id) => api.delete(`/savings-goals/${id}`).then((r) => r.data);
export const contributeToGoal = (id, amount) =>
  api.post(`/savings-goals/${id}/contribute`, { amount }).then((r) => r.data);
