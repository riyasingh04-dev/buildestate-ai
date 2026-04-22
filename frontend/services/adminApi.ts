import api from './api';

const adminApi = {
  // Stats
  getStats: () => api.get('/admin/stats'),

  // Users
  getUsers: () => api.get('/admin/users'),
  getUser: (id: number) => api.get(`/admin/users/${id}`),
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),
  blockUser: (id: number) => api.patch(`/admin/users/${id}/block`),
  unblockUser: (id: number) => api.patch(`/admin/users/${id}/unblock`),

  // Builders
  getBuilders: () => api.get('/admin/builders'),
  verifyBuilder: (id: number) => api.patch(`/admin/builders/${id}/verify`),

  // Properties
  getProperties: () => api.get('/admin/properties'),
  approveProperty: (id: number) => api.patch(`/admin/properties/${id}/approve`),
  rejectProperty: (id: number) => api.patch(`/admin/properties/${id}/reject`),
  deleteProperty: (id: number) => api.delete(`/admin/properties/${id}`),
  
  // Leads
  getLeads: () => api.get('/admin/leads'),
};

export default adminApi;
