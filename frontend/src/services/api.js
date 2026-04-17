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

export const profileService = {
  get: () => api.get('/auth/profile'),
  update: (data) => api.put('/auth/profile', data),
  uploadPic: (data) => api.post('/auth/profile-pic', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getStudents: () => api.get('/admin/students'),
  resetAttempt: (userId, quizId) => api.post('/admin/reset-attempt', { userId, quizId }),
  getAnalytics: (quizId) => api.get(`/admin/analytics/${quizId}`),
  getDifficultQuestions: (quizId) => api.get(`/admin/analytics/difficult/${quizId}`),
  exportResults: (id) => api.get(`/admin/export/${id}`, { responseType: 'blob' })
};

export const quizService = {
  getAll: () => api.get('/quizzes'),
  getById: (id) => api.get(`/quizzes/${id}`),
  create: (data) => api.post('/quizzes', data),
  update: (id, data) => api.put(`/quizzes/${id}`, data),
  publish: (id) => api.put(`/quizzes/${id}/publish`),
  delete: (id) => api.delete(`/quizzes/${id}`),
};

export const questionService = {
  getByQuiz: (quizId) => api.get(`/questions/${quizId}`),
  addManual: (data) => api.post('/questions/manual', data),
  uploadExcel: (formData) => api.post('/questions/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getTemplate: () => api.get('/questions/template', { responseType: 'blob' }),
  delete: (id) => api.delete(`/questions/${id}`),
};

export const studentService = {
  getDashboard: () => api.get('/student/dashboard'),
};

export const examService = {
  start: (quizId) => api.post('/exams/start', { quizId }),
  getQuestions: (examId) => api.get(`/exams/${examId}/questions`),
  save: (data) => api.post('/exams/save', data),
  getProgress: (attemptId) => api.get(`/exams/progress/${attemptId}`),
  getTimeRemaining: (attemptId) => api.get(`/exams/time/${attemptId}`),
  submit: (data) => api.post('/exams/submit', data)
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
