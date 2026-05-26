import axios from 'axios';
import useAuthStore from '../store/authStore';

const axiosInstance = axios.create({
    // WAJIB pakai import.meta.env jika menggunakan Vite
    baseURL: import.meta.env.VITE_API_URL || '/', 
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true
  });

// INTERCEPTOR: Polisi yang memeriksa setiap request sebelum terbang ke Backend
axiosInstance.interceptors.request.use((config) => {
  // Ambil token secara dinamis dan real-time dari Zustand Store
  const token = useAuthStore.getState().token;
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosInstance;