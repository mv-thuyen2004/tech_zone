"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/store/useAuth";
import { useCart } from "@/store/useCart";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function CheckoutPage() {
  const { user, isAuthenticated, token } = useAuth();
  const { carts, currentUserId, clearCart } = useCart();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form thông tin lấy mặc định từ tài khoản
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
  });

  const items = currentUserId ? (carts[currentUserId] || []) : [];
  const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);

  useEffect(() => {
    setIsMounted(true);
    if (isMounted) {
      if (!isAuthenticated) router.push("/login");
      if (items.length === 0) router.push("/cart"); // Giỏ rỗng thì đuổi về
    }
  }, [isMounted, isAuthenticated, router, items.length]);

  // Đổ dữ liệu từ user vào form sau khi component đã mount
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [user]);

  if (!isMounted || !isAuthenticated || items.length === 0) return null;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Đóng gói mảng items để gửi lên cho hợp chuẩn Model của Backend
      const orderItems = items.map(item => ({
        productId: item._id,
        quantity: item.quantity,
        price: item.price
      }));

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          items: orderItems,
          shippingInfo: formData,
          totalPrice,
          paymentMethod: "COD"
        })
      });

      if (!res.ok) throw new Error("Đặt hàng thất bại");

      alert("🎉 Đặt hàng thành công! TechZone sẽ sớm liên hệ để giao hàng cho bạn.");
      clearCart(); // Dọn sạch giỏ hàng
      router.push("/"); // Đá về trang chủ
      
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Thanh toán đơn hàng</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Cột 1: Form địa chỉ */}
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-6">Thông tin giao hàng</h2>
            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Người nhận</label>
                <Input 
                  required 
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Số điện thoại</label>
                <Input 
                  required 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Địa chỉ chi tiết</label>
                <Input 
                  required 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Cột 2: Tóm tắt giỏ hàng */}
        <Card className="border-none shadow-md bg-slate-50/50">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-6">Đơn hàng của bạn</h2>
            
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
              {items.map((item) => (
                <div key={item._id} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded border" />
                    <div>
                      <p className="font-medium line-clamp-1 max-w-[180px]">{item.name}</p>
                      <p className="text-muted-foreground text-xs">SL: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-semibold">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Tạm tính:</span>
                <span>{totalPrice.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Phí vận chuyển:</span>
                <span>0đ</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Phương thức:</span>
                <span>Thanh toán khi nhận hàng (COD)</span>
              </div>
            </div>

            <div className="border-t my-4"></div>
            
            <div className="flex justify-between items-end mb-8">
              <span className="font-bold text-lg">Tổng cộng:</span>
              <span className="text-2xl font-extrabold text-red-600">{totalPrice.toLocaleString('vi-VN')}đ</span>
            </div>

            <Button 
              type="submit" 
              form="checkout-form" // Trỏ submit vào form ở bên kia
              className="w-full h-14 text-base rounded-xl bg-primary" 
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Xác nhận đặt hàng"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}