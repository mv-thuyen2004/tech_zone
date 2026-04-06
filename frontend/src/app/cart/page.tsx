"use client";

import { useCart } from "@/store/useCart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartPage() {
  // Kỹ thuật tránh lỗi Hydration của Next.js
  const [isMounted, setIsMounted] = useState(false);
  const { items, addItem, decreaseItem, removeItem } = useCart();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null; // Chỉ render khi đã load xong ở Client

  // Tính tổng tiền đơn hàng
  const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);

  // Giao diện khi giỏ hàng trống
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="bg-muted p-6 rounded-full mb-6">
          <ShoppingBag className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Giỏ hàng của bạn đang trống</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          Có vẻ như bạn chưa chọn được phụ kiện nào. Hãy dạo một vòng để tìm những món đồ công nghệ ưng ý nhé!
        </p>
        <Link href="/">
          <Button size="lg" className="rounded-xl px-8">Tiếp tục mua sắm</Button>
        </Link>
      </div>
    );
  }

  // Giao diện khi có hàng
  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 tracking-tight">Giỏ hàng của bạn</h1>
      
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cột trái: Danh sách sản phẩm */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item._id} className="overflow-hidden border-none shadow-sm bg-card">
              <CardContent className="p-4 flex sm:flex-row flex-col items-start sm:items-center gap-4">
                {/* Ảnh sản phẩm */}
                <div className="w-24 h-24 bg-muted rounded-xl flex-shrink-0 border p-2">
                  <img 
                    src={item.image || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=150"} 
                    alt={item.name} 
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                
                {/* Thông tin */}
                <div className="flex-1 min-w-0">
                  <Link href={`/product/${item._id}`} className="hover:text-primary transition-colors">
                    <h3 className="font-semibold text-base line-clamp-2">{item.name}</h3>
                  </Link>
                  <p className="text-red-600 font-bold mt-2">{(item.price).toLocaleString('vi-VN')}đ</p>
                </div>

                {/* Nút Tăng/Giảm/Xóa */}
                <div className="flex items-center gap-4 sm:ml-auto w-full sm:w-auto justify-between sm:justify-start mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0">
                  <div className="flex items-center gap-3 bg-muted rounded-lg p-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={() => decreaseItem(item._id)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-6 text-center font-medium text-sm">{item.quantity}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={() => addItem(item)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors" 
                    onClick={() => removeItem(item._id)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cột phải: Tổng kết đơn hàng */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 border-none shadow-md bg-slate-50/50">
            <CardContent className="p-6">
              <h3 className="font-bold text-xl mb-6">Tóm tắt đơn hàng</h3>
              
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tạm tính:</span>
                  <span className="font-medium">{totalPrice.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phí vận chuyển:</span>
                  <span className="text-green-600 font-medium">Miễn phí (HUMG)</span>
                </div>
              </div>

              <div className="border-t my-6"></div>

              <div className="flex justify-between mb-8 items-end">
                <span className="font-bold text-lg">Tổng cộng:</span>
                <span className="font-extrabold text-2xl text-red-600">{totalPrice.toLocaleString('vi-VN')}đ</span>
              </div>
              
              <Button className="w-full h-14 text-base rounded-xl bg-primary hover:bg-primary/90">
                Tiến hành thanh toán <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}