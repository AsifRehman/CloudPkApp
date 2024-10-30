// api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create an Axios instance
const api = axios.create({
  baseURL: 'https://api.cloudpkerp.com:8081/api', // Replace with your API base URL
  timeout: 10000,
});

// Add an interceptor to attach JWT token to every request
api.interceptors.request.use(
  
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = 'Bearer ' + token.replace(/"/g, '');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
