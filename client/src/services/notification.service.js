import api from './api';

export const notificationService = {
  async getNotifications(limit = 50) {
    return await api.get('/notifications', { params: { limit } });
  },

  async markAsRead(id) {
    return await api.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead() {
    return await api.patch('/notifications/read-all');
  },

  async delete(id) {
    return await api.delete(`/notifications/${id}`);
  },
};

export default notificationService;
