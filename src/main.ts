import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import axios from 'axios';

// Configure axios to use the token in each request
axios.interceptors.request.use(
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

// Handle 401 Unauthorized responses globally
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    }
    return Promise.reject(error);
  }
);

createApp(App).use(router).mount('#app');