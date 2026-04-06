import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuth } from './useAuth'; // Để lấy token xác thực

interface CartItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
}

interface CartStore {
  carts: Record<string, CartItem[]>; 
  currentUserId: string | null;

  setCurrentUser: (userId: string | null) => void;
  fetchCart: () => Promise<void>; // Hàm mới: Kéo data từ DB về
  addItem: (product: any) => void;
  decreaseItem: (id: string) => void;
  removeItem: (id: string) => void;
  clearCart: () => void; 
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      carts: {},
      currentUserId: null,

      setCurrentUser: (userId) => set({ currentUserId: userId }),

      // --- HÀM MỚI: ĐỒNG BỘ TỪ DATABASE VỀ MÁY ---
      fetchCart: async () => {
        const state = get();
        const token = useAuth.getState().token; // Lấy token từ Auth Store
        if (!state.currentUserId || !token) return;

        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            // Xử lý map data từ Backend sang dạng của Frontend
            const formattedCart = data.items.map((item: any) => ({
              _id: item.productId._id,
              name: item.productId.name,
              price: item.productId.price,
              image: item.productId.images?.[0],
              quantity: item.quantity,
              stock: item.productId.stock || 100 
            }));
            set({ carts: { ...get().carts, [state.currentUserId]: formattedCart } });
          }
        } catch (error) {
          console.error("Lỗi đồng bộ giỏ hàng:", error);
        }
      },

      addItem: async (product) => {
        const state = get();
        const token = useAuth.getState().token;
        if (!state.currentUserId) return; 

        const userCart = state.carts[state.currentUserId] || [];
        const existingItem = userCart.find((item) => item._id === product._id);
        const currentQty = existingItem ? existingItem.quantity : 0;

        if (currentQty >= product.stock) {
          alert(`Rất tiếc! Bạn chỉ có thể mua tối đa ${product.stock} sản phẩm này.`);
          return; 
        }

        // 1. Cập nhật UI ngay lập tức cho mượt
        let updatedCart;
        if (existingItem) {
          updatedCart = userCart.map((item) =>
            item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          updatedCart = [...userCart, { ...product, quantity: 1, image: product.images?.[0] }];
        }
        set({ carts: { ...get().carts, [state.currentUserId]: updatedCart } });

        // 2. Gửi API chạy ngầm lên Database
        if (token) {
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ productId: product._id, quantity: 1 })
          }).catch(err => console.error("Lỗi sync:", err));
        }
      },

      decreaseItem: async (id) => {
        const state = get();
        const token = useAuth.getState().token;
        if (!state.currentUserId) return;

        const userCart = state.carts[state.currentUserId] || [];
        const existingItem = userCart.find((item) => item._id === id);
        if (!existingItem) return;

        let updatedCart;
        let isDelete = false;

        // Nếu số lượng là 1 mà bấm giảm -> Xóa luôn
        if (existingItem.quantity === 1) {
          updatedCart = userCart.filter((item) => item._id !== id);
          isDelete = true;
        } else {
          updatedCart = userCart.map((item) =>
            item._id === id ? { ...item, quantity: item.quantity - 1 } : item
          );
        }

        set({ carts: { ...get().carts, [state.currentUserId]: updatedCart } });

        // Gọi API tương ứng (Xóa hoặc Giảm số lượng)
        if (token) {
          if (isDelete) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/${id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` }
            }).catch(err => console.error(err));
          } else {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ productId: id, quantity: -1 }) // Backend sẽ tự cộng trừ
            }).catch(err => console.error(err));
          }
        }
      },

      removeItem: async (id) => {
        const state = get();
        const token = useAuth.getState().token;
        if (!state.currentUserId) return;

        const userCart = state.carts[state.currentUserId] || [];
        set({ carts: { ...get().carts, [state.currentUserId]: userCart.filter((item) => item._id !== id) } });

        if (token) {
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          }).catch(err => console.error(err));
        }
      },

      clearCart: async () => {
        const state = get();
        const token = useAuth.getState().token;
        if (!state.currentUserId) return;

        set({ carts: { ...get().carts, [state.currentUserId]: [] } });

        if (token) {
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/clear`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          }).catch(err => console.error(err));
        }
      },
    }),
    { name: 'techzone-carts-by-user' }
  )
);