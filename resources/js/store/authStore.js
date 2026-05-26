import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      
      login: (user, token, refreshToken) => set({ 
        user: user, 
        token: token, 
        refreshToken: refreshToken || null,
        isAuthenticated: true 
      }),
      
      logout: () => set({ 
        user: null, 
        token: null, 
        refreshToken: null,
        isAuthenticated: false 
      }),
    }),
    {
      name: 'auth-storage', // Nama kunci di LocalStorage
    }
  )
);

export default useAuthStore;