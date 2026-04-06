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
  items: CartItem[];
  addItem: (product: any) => void;
  decreaseItem: (id: string) => void; // Hàm mới
  removeItem: (id: string) => void;
  clearCart: () => void;
}

export const useCart = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      // Tăng số lượng hoặc thêm mới
      addItem: (product) => set((state) => {
        const existingItem = state.items.find((item) => item._id === product._id);
        if (existingItem) {
          return {
            items: state.items.map((item) =>
              item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
            ),
          };
        }
        // Lưu ý: Lấy ảnh đầu tiên trong mảng images để hiển thị
        return { items: [...state.items, { ...product, quantity: 1, image: product.images?.[0] }] };
      }),
      // Giảm số lượng (Nếu = 1 mà trừ tiếp thì xóa luôn)
      decreaseItem: (id) => set((state) => {
        const existingItem = state.items.find((item) => item._id === id);
        if (existingItem?.quantity === 1) {
          return { items: state.items.filter((item) => item._id !== id) };
        }
        return {
          items: state.items.map((item) =>
            item._id === id ? { ...item, quantity: item.quantity - 1 } : item
          ),
        };
      }),
      // Xóa hẳn sản phẩm khỏi giỏ
      removeItem: (id) => set((state) => ({
        items: state.items.filter((item) => item._id !== id),
      })),
      // Xóa sạch giỏ hàng (Dùng khi thanh toán xong)
      clearCart: () => set({ items: [] }),
    }),
    { name: 'techzone-cart' } // Tên key lưu trong LocalStorage
  )
);