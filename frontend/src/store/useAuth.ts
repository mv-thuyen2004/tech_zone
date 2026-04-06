import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string; // 'user' hoặc 'admin'
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuth = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: 'techzone-auth' } // Lưu token vào LocalStorage
  )
);