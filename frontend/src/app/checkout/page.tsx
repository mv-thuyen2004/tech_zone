"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/store/useAuth";
import { useCart } from "@/store/useCart";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, Truck } from "lucide-react"; // Import icon

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

  // State MỚI: Chọn phương thức thanh toán
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const items = currentUserId ? (carts[currentUserId] || []) : [];
  const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);

  useEffect(() => {
    setIsMounted(true);
    if (isMounted) {
      if (!isAuthenticated) router.push("/login");
      if (items.length === 0) router.push("/cart"); 
    }
  }, [isMounted, isAuthenticated, router, items.length]);

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

  // HÀM XỬ LÝ ĐẶT HÀNG ĐÃ NÂNG CẤP
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderItems = items.map(item => ({
        productId: item._id,
        quantity: item.quantity,
        price: item.price
      }));

      // 1. GỌI API TẠO ĐƠN HÀNG TRƯỚC
      const orderRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          items: orderItems,
          shippingInfo: formData,
          totalPrice,
          paymentMethod // "COD" hoặc "VNPAY"
        })
      });

      if (!orderRes.ok) throw new Error("Tạo đơn hàng thất bại!");
      const newOrder = await orderRes.json(); // Lấy data đơn hàng vừa tạo để lấy ID

      // Dọn giỏ hàng ngay sau khi chốt đơn thành công
      clearCart(); 

      // 2. KIỂM TRA PHƯƠNG THỨC THANH TOÁN
      if (paymentMethod === "VNPAY") {
        // Gọi API lấy Link thanh toán VNPAY
        const vnpRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${newOrder._id}/create_payment_url`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const vnpData = await vnpRes.json();
        if (vnpData.paymentUrl) {
          // CHUYỂN HƯỚNG SANG TRANG VNPAY
          window.location.href = vnpData.paymentUrl;
        } else {
          throw new Error("Không thể tạo link thanh toán VNPAY");
        }
      } else {
        // NẾU LÀ COD
        alert("🎉 Đặt hàng thành công! TechZone sẽ sớm giao hàng cho bạn.");
        router.push("/my-orders");
      }
      
    } catch (error: any) {
      alert(error.message);
      setLoading(false);
    } 
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Thanh toán đơn hàng</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Cột 1: Form địa chỉ & Phương thức thanh toán */}
        <div className="space-y-6">
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

          {/* KHU VỰC CHỌN PHƯƠNG THỨC THANH TOÁN */}
          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-6">Phương thức thanh toán</h2>
              <div className="space-y-3">
                
                {/* Lựa chọn COD */}
                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "COD" ? "border-primary bg-primary/5" : "border-slate-100 hover:border-slate-200"}`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="COD" 
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                    className="w-5 h-5 accent-primary"
                  />
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 text-green-600 rounded-full"><Truck className="w-5 h-5"/></div>
                    <div>
                      <p className="font-semibold text-slate-900">Thanh toán khi nhận hàng (COD)</p>
                      <p className="text-xs text-muted-foreground">Nhận hàng rồi mới thanh toán</p>
                    </div>
                  </div>
                </label>

                {/* Lựa chọn VNPAY */}
                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "VNPAY" ? "border-primary bg-primary/5" : "border-slate-100 hover:border-slate-200"}`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="VNPAY" 
                    checked={paymentMethod === "VNPAY"}
                    onChange={() => setPaymentMethod("VNPAY")}
                    className="w-5 h-5 accent-primary"
                  />
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-full"><Wallet className="w-5 h-5"/></div>
                    <div>
                      <p className="font-semibold text-slate-900">Thanh toán qua VNPAY</p>
                      <p className="text-xs text-muted-foreground">Quẹt thẻ ATM, Visa, QRCode ứng dụng NH</p>
                    </div>
                  </div>
                </label>

              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cột 2: Tóm tắt giỏ hàng (Giữ nguyên) */}
        <Card className="border-none shadow-md bg-slate-50/50 h-fit">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-6">Đơn hàng của bạn</h2>
            
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={item._id} className="flex justify-between items-center text-sm border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg border bg-white" />
                    <div>
                      <p className="font-medium line-clamp-1 max-w-[180px] sm:max-w-[250px]">{item.name}</p>
                      <p className="text-muted-foreground text-xs mt-1">
                        SL: {item.quantity} <span className="mx-1">x</span> {item.price.toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-red-600">
                    {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                  </span>
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
            </div>

            <div className="border-t my-4"></div>
            
            <div className="flex justify-between items-end mb-8">
              <span className="font-bold text-lg">Tổng cộng:</span>
              <span className="text-2xl font-extrabold text-red-600">{totalPrice.toLocaleString('vi-VN')}đ</span>
            </div>

            <Button 
              type="submit" 
              form="checkout-form"
              className="w-full h-14 text-base rounded-xl bg-primary" 
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : (paymentMethod === "VNPAY" ? "Thanh toán VNPAY" : "Xác nhận đặt hàng")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}