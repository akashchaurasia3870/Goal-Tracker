import api from './api';

export const taskService = {
  async getTasks(params = {}) {
    return await api.get('/tasks', { params });
  },

  async getTaskById(id) {
    return await api.get(`/tasks/${id}`);
  },

  async createTask(data) {
    return await api.post('/tasks', data);
  },

  async updateTask(id, data) {
    return await api.put(`/tasks/${id}`, data);
  },

  async toggleComplete(id) {
    return await api.patch(`/tasks/${id}/complete`);
  },

  async toggleChecklistItem(id, itemId, isCompleted) {
    return await api.patch(`/tasks/${id}/checklist`, { itemId, isCompleted });
  },

  async bulkAction(taskIds, action, payload = {}) {
    return await api.post('/tasks/bulk', { taskIds, action, payload });
  },

  async deleteTask(id) {
    return await api.delete(`/tasks/${id}`);
  },
};

export default taskService;
