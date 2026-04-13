"use client";

import { useCart } from "@/store/useCart";
import { useAuth } from "@/store/useAuth"; 
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; // Đã thêm import Input
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag } from "lucide-react"; // Đã thêm icon Tag
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartPage() {
  // Kỹ thuật tránh lỗi Hydration của Next.js
  const [isMounted, setIsMounted] = useState(false);
  const { carts, currentUserId, addItem, decreaseItem, removeItem } = useCart();

  const { isAuthenticated, token } = useAuth();
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const router = useRouter();

  // --- STATE QUẢN LÝ VOUCHER ---
  const [voucherCode, setVoucherCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Nếu đã mount xong mà thấy chưa đăng nhập thì đuổi ra ngoài ngay
    if (isMounted && !isAuthenticated) {
      router.push("/login");
    }
  }, [isMounted, isAuthenticated, router]);

  // Trích xuất mảng sản phẩm tương ứng với ID hiện tại
  const items = currentUserId ? (carts[currentUserId] || []) : [];

  if (!isMounted) return null; // Chỉ render khi đã load xong ở Client

  // Tính tổng tiền đơn hàng
  const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);
  
  // Tính tổng tiền sau khi áp mã giảm giá (Đảm bảo không bị âm)
  const finalTotal = Math.max(0, totalPrice - discount);

  // --- HÀM XỬ LÝ ÁP DỤNG VOUCHER ---
  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setMessage({ text: "Vui lòng nhập mã giảm giá", type: "error" });
      return;
    }
    if (!token) {
      setMessage({ text: "Vui lòng đăng nhập để dùng mã giảm giá", type: "error" });
      return;
    }
    
    setIsApplying(true);
    setMessage({ text: "", type: "" }); // Reset thông báo

    try {
      const res = await fetch(`${apiBase}/vouchers/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          code: voucherCode, 
          cartTotal: totalPrice 
        }),
      });

      const data = await res.json();

      if (data.success) {
        setDiscount(data.data.discountAmount);
        setMessage({ text: "🎉 " + data.message, type: "success" });
      } else {
        setDiscount(0);
        setMessage({ text: "❌ " + data.message, type: "error" });
      }
    } catch (error) {
      setDiscount(0);
      setMessage({ text: "❌ Lỗi kết nối đến máy chủ", type: "error" });
    } finally {
      setIsApplying(false);
    }
  };

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

                {/* Dòng hiển thị tiền giảm giá (chỉ hiện khi có áp mã) */}
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Giảm giá:</span>
                    <span>- {discount.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
              </div>

              <div className="border-t my-6"></div>

              {/* KHU VỰC NHẬP MÃ GIẢM GIÁ MỚI THÊM */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Tag className="h-4 w-4" /> Mã giảm giá
                </label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Nhập mã..." 
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())} // Ép viết hoa khi gõ
                    className="uppercase flex-1 bg-white"
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleApplyVoucher}
                    disabled={isApplying || !voucherCode}
                    className="bg-white"
                  >
                    {isApplying ? "Đang xử lý..." : "Áp dụng"}
                  </Button>
                </div>
                {/* Thông báo kết quả áp mã */}
                {message.text && (
                  <p className={`text-sm mt-2 font-medium ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                    {message.text}
                  </p>
                )}
              </div>

              <div className="border-t my-6"></div>

              <div className="flex justify-between mb-8 items-end">
                <span className="font-bold text-lg">Tổng cộng:</span>
                {/* Cập nhật lại hiển thị tổng tiền cuối cùng */}
                <span className="font-extrabold text-2xl text-red-600">{finalTotal.toLocaleString('vi-VN')}đ</span>
              </div>
              
              {/* Truyền voucherCode và discount qua URL để trang Checkout đọc được */}
              <Link href={`/checkout${discount > 0 ? `?voucher=${voucherCode}&discount=${discount}` : ''}`}>
                <Button className="w-full h-14 text-base rounded-xl bg-primary hover:bg-primary/90 mt-2">
                  Tiến hành thanh toán <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}