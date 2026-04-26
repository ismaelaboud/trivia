import axios from 'axios';
import { API_URL } from '../config/api';

const API_BASE_URL = `${API_URL}/api`;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (username, email, password) => api.post('/auth/register', { username, email, password }),
  guestLogin: (username) => api.post('/auth/guest', { username }),
  getCurrentUser: () => api.get('/auth/me'),
};

// Channels API
export const channelsAPI = {
  search: (query, page = 1, limit = 10) => 
    api.get('/channels/search', { params: { q: query, page, limit } }),
  getBySlug: (slug) => api.get(`/channels/${slug}`),
  create: (channelData) => api.post('/channels', channelData),
  join: (slug) => api.post(`/channels/${slug}/join`),
  leave: (slug) => api.post(`/channels/${slug}/leave`),
  getUserChannels: () => api.get('/channels/my/channels'),
};

// Questions API
export const questionsAPI = {
  create: (questionData) => api.post('/questions', questionData),
  getActive: (channelSlug) => api.get(`/questions/${channelSlug}/active`),
  revealAnswer: (questionId) => api.patch(`/questions/${questionId}/reveal`),
  getHistory: (channelSlug, page = 1, limit = 10) => 
    api.get(`/questions/${channelSlug}/history`, { params: { page, limit } }),
  getChannelQuestions: (channelSlug) => api.get(`/questions/channel/${channelSlug}`),
  activate: (questionId) => api.patch(`/questions/${questionId}/activate`),
  delete: (questionId) => api.delete(`/questions/${questionId}`),
  getSubmissions: (questionId) => api.get(`/questions/${questionId}/submissions`),
};

// Submissions API
export const submissionsAPI = {
  submit: (submissionData) => api.post('/submissions', submissionData),
  getUserSubmission: (questionId) => api.get(`/submissions/question/${questionId}`),
  getAllSubmissions: (questionId) => api.get(`/submissions/question/${questionId}/all`),
};

export default api;
