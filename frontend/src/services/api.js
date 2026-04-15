import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  resetAttempt: (userId, quizId) => api.post('/admin/reset-attempt', { userId, quizId }),
  getAnalytics: (quizId) => api.get(`/admin/analytics/${quizId}`)
};

export const quizService = {
  getAll: () => api.get('/quizzes'),
  getById: (id) => api.get(`/quizzes/${id}`),
  create: (data) => api.post('/quizzes', data),
  update: (id, data) => api.put(`/quizzes/${id}`, data),
  delete: (id) => api.delete(`/quizzes/${id}`),
};

export const questionService = {
  getByQuiz: (quizId) => api.get(`/questions/${quizId}`),
  addManual: (data) => api.post('/questions/manual', data),
  uploadExcel: (formData) => api.post('/questions/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const studentService = {
  getDashboard: () => api.get('/student/dashboard'),
};

export const examService = {
  start: (quizId) => api.post('/exams/start', { quizId }),
  save: (data) => api.post('/exams/save', data),
  getProgress: (attemptId) => api.get(`/exams/progress/${attemptId}`),
  getTimeRemaining: (attemptId) => api.get(`/exams/time/${attemptId}`),
  submit: (attemptId) => api.post('/exams/submit', { attemptId }),
};

export const executionService = {
  run: (language, code) => api.post('/execute', { language, code }),
};

export const resultService = {
  getDetail: (resultId) => api.get(`/results/${resultId}`),
  getHistory: () => api.get('/results/history'),
};

export const leaderboardService = {
  getByQuiz: (quizId) => api.get(`/leaderboard/quiz/${quizId}`),
  getGlobal: () => api.get('/leaderboard/global'),
};

export default api;
