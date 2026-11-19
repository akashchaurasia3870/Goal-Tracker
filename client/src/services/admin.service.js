import api from './api';

const adminService = {
  /**
   * Get paginated user list
   */
  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data || response;
  },

  /**
   * Toggle user active status
   */
  updateUserStatus: async (id, isActive) => {
    const response = await api.patch(`/admin/users/${id}/status`, { isActive });
    return response.data || response;
  },

  /**
   * Change user role (User / Admin)
   */
  updateUserRole: async (id, role) => {
    const response = await api.patch(`/admin/users/${id}/role`, { role });
    return response.data || response;
  },

  /**
   * Get platform & system health statistics
   */
  getSystemStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data || response;
  },

  /**
   * Get system activity & audit logs
   */
  getActivityLogs: async (params = {}) => {
    const response = await api.get('/admin/activity-logs', { params });
    return response.data || response;
  },
};

export default adminService;
