import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const taskAPI = {
  // Process a new task
  processTask: async (taskData) => {
    const response = await api.post('/tasks/process', taskData);
    return response.data;
  },

  // Get interaction logs
  getLogs: async (limit = 50, offset = 0) => {
    const response = await api.get('/tasks/logs', {
      params: { limit, offset }
    });
    return response.data;
  },

  // Get specific log by ID
  getLogById: async (id) => {
    const response = await api.get(`/tasks/logs/${id}`);
    return response.data;
  },

  // Delete specific log
  deleteLog: async (id) => {
    const response = await api.delete(`/tasks/logs/${id}`);
    return response.data;
  },

  // Delete all logs
  deleteAllLogs: async () => {
    const response = await api.delete('/tasks/logs');
    return response.data;
  },

  // Get statistics
  getStats: async () => {
    const response = await api.get('/tasks/stats');
    return response.data;
  }
};

export const healthAPI = {
  // Health check
  checkHealth: async () => {
    const response = await api.get('/health');
    return response.data;
  }
};

export default api;
