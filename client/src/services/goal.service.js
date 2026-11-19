import api from './api';

export const goalService = {
  async getGoals(params = {}) {
    return await api.get('/goals', { params });
  },

  async getGoalById(id) {
    return await api.get(`/goals/${id}`);
  },

  async createGoal(data) {
    return await api.post('/goals', data);
  },

  async updateGoal(id, data) {
    return await api.put(`/goals/${id}`, data);
  },

  async deleteGoal(id) {
    return await api.delete(`/goals/${id}`);
  },

  async togglePin(id) {
    return await api.patch(`/goals/${id}/pin`);
  },

  async toggleArchive(id) {
    return await api.patch(`/goals/${id}/archive`);
  },

  async duplicate(id) {
    return await api.post(`/goals/${id}/duplicate`);
  },

  async getSummary() {
    return await api.get('/goals/summary');
  },
};

export default goalService;
