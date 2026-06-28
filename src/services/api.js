import axios from 'axios';
import { getAccessToken, getStoredUser, updateStoredUser, clearStoredUser } from '../utils/authStorage';

const API_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const accessToken = getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRequest = ['/auth/login', '/auth/register', '/auth/refresh-token'].some((path) =>
      originalRequest?.url?.includes(path)
    );

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
      originalRequest._retry = true;

      try {
        const user = getStoredUser();
        const refreshToken = user?.data?.refreshToken;

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken } = response.data.data;

        user.data.accessToken = accessToken;
        updateStoredUser(user);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        clearStoredUser();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

export const changePassword = async ({ currentPassword, newPassword }) => {
  const response = await api.put('/auth/change-password', {
    currentPassword,
    newPassword,
  });
  return response.data;
};

export const getStatsEntries = async (page = 1, limit = 5) => {
  const response = await api.get('/stats', { params: { page, limit } });
  return response.data;
};

export const addStatsEntry = async (rawText) => {
  const response = await api.post('/stats', { rawText });
  return response.data;
};

export const deleteStatsEntry = async (id) => {
  const response = await api.delete(`/stats/${id}`);
  return response.data;
};

export const getStatsRank = async () => {
  const response = await api.get('/stats/rank');
  return response.data;
};

export const getDashboardSummary = async () => {
  const response = await api.get('/stats/summary');
  return response.data;
};

export const getLeaderboard = async () => {
  const response = await api.get('/stats/leaderboard');
  return response.data;
};

export default api; 