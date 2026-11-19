import api from './api';

export const calendarService = {
  async getEvents(params = {}) {
    return await api.get('/calendar', { params });
  },
};

export default calendarService;
