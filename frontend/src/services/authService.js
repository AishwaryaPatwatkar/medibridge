import api from './api';

const authService = {
  register: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data && response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      // Decodes some JWT details to cache basic user info (or fetch profile immediately)
      // For safety, we will just return the token data
    }
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export default authService;
