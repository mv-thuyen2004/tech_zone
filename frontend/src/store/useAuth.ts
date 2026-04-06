import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useCart } from './useCart'; // NHÚNG THÊM DÒNG NÀY

interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string;
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
      login: (user, token) => {
        // Vừa login xong là lấy ID gán sang làm chìa khóa cho Giỏ hàng
        useCart.getState().setCurrentUser(user._id); 
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        // Vừa logout là rút chìa khóa giỏ hàng ra ngay
        useCart.getState().setCurrentUser(null); 
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    { name: 'techzone-auth' }
  )
);