import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartStore {
  // Lưu giỏ hàng dạng: { "id_user_A": [...], "id_user_B": [...] }
  carts: Record<string, CartItem[]>; 
  currentUserId: string | null;

  setCurrentUser: (userId: string | null) => void;
  addItem: (product: any) => void;
  decreaseItem: (id: string) => void;
  removeItem: (id: string) => void;
  clearCart: () => void; // Dùng khi thanh toán xong
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      carts: {},
      currentUserId: null,

      // Hàm để gán chìa khóa (ID)
      setCurrentUser: (userId) => set({ currentUserId: userId }),

      addItem: (product) => set((state) => {
        if (!state.currentUserId) return state; // Phải có chìa khóa mới cho thao tác
        const userCart = state.carts[state.currentUserId] || [];
        const existingItem = userCart.find((item) => item._id === product._id);

        let updatedCart;
        if (existingItem) {
          updatedCart = userCart.map((item) =>
            item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          updatedCart = [...userCart, { ...product, quantity: 1, image: product.images?.[0] }];
        }
        return { carts: { ...state.carts, [state.currentUserId]: updatedCart } };
      }),

      decreaseItem: (id) => set((state) => {
        if (!state.currentUserId) return state;
        const userCart = state.carts[state.currentUserId] || [];
        const existingItem = userCart.find((item) => item._id === id);

        let updatedCart;
        if (existingItem?.quantity === 1) {
          updatedCart = userCart.filter((item) => item._id !== id);
        } else {
          updatedCart = userCart.map((item) =>
            item._id === id ? { ...item, quantity: item.quantity - 1 } : item
          );
        }
        return { carts: { ...state.carts, [state.currentUserId]: updatedCart } };
      }),

      removeItem: (id) => set((state) => {
        if (!state.currentUserId) return state;
        const userCart = state.carts[state.currentUserId] || [];
        return {
          carts: { ...state.carts, [state.currentUserId]: userCart.filter((item) => item._id !== id) },
        };
      }),

      clearCart: () => set((state) => {
        if (!state.currentUserId) return state;
        return {
          carts: { ...state.carts, [state.currentUserId]: [] },
        };
      }),
    }),
    { name: 'techzone-carts-by-user' } // Đổi tên key để reset sạch cache cũ đang bị sai
  )
);