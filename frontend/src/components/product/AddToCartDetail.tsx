"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/store/useCart";
import { PackageX, ShoppingCart } from "lucide-react";
import { useAuth } from "@/store/useAuth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddToCartDetail({ product }: { product: any }) {
  const addItem = useCart((state) => state.addItem);
  const isAuthenticated = useAuth((state) => state.isAuthenticated);
  const router = useRouter();
  const [added, setAdded] = useState(false);

  // Biến kiểm tra hết hàng
  const isOutOfStock = product.stock <= 0;
  
  const handleAdd = () => {
    // CHẶN CỬA Ở ĐÂY
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (

    <div className="space-y-4">
    <Button 
      onClick={handleAdd}
      disabled={isOutOfStock} // KHÓA NÚT KHI HẾT HÀNG
      size="lg" 
      className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white rounded-xl h-12 px-8 text-base"
    >
      
      {isOutOfStock ? (
          <><PackageX className="mr-2 h-5 w-5" /> Sản phẩm đã hết hàng</>
        ) : (
          <><ShoppingCart className="mr-2 h-5 w-5" /> Thêm vào giỏ hàng</>
        )}
      </Button>
      {isOutOfStock && (
        <p className="text-sm text-red-500 font-medium">
          *Sản phẩm này hiện đang tạm hết hàng, bạn có thể tham khảo các phụ kiện gợi ý bên dưới nhé!
        </p>
      )}
      </div>
  );
}