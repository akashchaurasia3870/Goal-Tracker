import api from './api';

export const recurringService = {
  async getRecurringTasks() {
    return await api.get('/recurring-tasks');
  },

  async createRecurringTask(data) {
    return await api.post('/recurring-tasks', data);
  },

  async getOccurrences(params = {}) {
    return await api.get('/recurring-tasks/occurrences', { params });
  },

  async updateOccurrence(id, status, notes = '') {
    return await api.patch(`/recurring-tasks/occurrences/${id}`, { status, notes });
  },

  async pause(id) {
    return await api.patch(`/recurring-tasks/${id}/pause`);
  },

  async resume(id) {
    return await api.patch(`/recurring-tasks/${id}/resume`);
  },

  async delete(id) {
    return await api.delete(`/recurring-tasks/${id}`);
  },
};

export default recurringService;
