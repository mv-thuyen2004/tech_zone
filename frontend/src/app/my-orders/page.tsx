"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/store/useAuth";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Package, Clock, Truck, CheckCircle2, XCircle, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Chưa đăng nhập thì đuổi về trang login
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchMyOrders = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/myorders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (error) {
        console.error("Lỗi tải đơn hàng:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchMyOrders();
  }, [token, isAuthenticated, router]);

  // Chọn icon và màu sắc tùy theo trạng thái
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'Chờ xác nhận': return { color: 'text-yellow-600 bg-yellow-100', icon: <Clock className="w-4 h-4 mr-1" /> };
      case 'Đang giao hàng': return { color: 'text-blue-600 bg-blue-100', icon: <Truck className="w-4 h-4 mr-1" /> };
      case 'Đã giao thành công': return { color: 'text-green-600 bg-green-100', icon: <CheckCircle2 className="w-4 h-4 mr-1" /> };
      case 'Đã hủy': return { color: 'text-red-600 bg-red-100', icon: <XCircle className="w-4 h-4 mr-1" /> };
      default: return { color: 'text-slate-600 bg-slate-100', icon: <Package className="w-4 h-4 mr-1" /> };
    }
  };

  if (loading) {
    return <div className="text-center py-20 animate-pulse text-muted-foreground">Đang lấy thông tin đơn hàng...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Đơn hàng của tôi</h1>
        <p className="text-muted-foreground">Quản lý và theo dõi trạng thái các sản phẩm bạn đã mua.</p>
      </div>

      {orders.length === 0 ? (
        <Card className="border-dashed border-2 bg-slate-50">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="bg-slate-200 p-4 rounded-full mb-4">
              <ShoppingBag className="w-8 h-8 text-slate-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Bạn chưa có đơn hàng nào</h2>
            <p className="text-muted-foreground mb-6">Hãy dạo quanh cửa hàng và chọn cho mình những món đồ ưng ý nhé!</p>
            <Link href="/">
              <Button className="rounded-xl px-8">Tiếp tục mua sắm</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const statusStyle = getStatusDisplay(order.status);
            
            return (
              <Card key={order._id} className="border-none shadow-sm overflow-hidden transition-all hover:shadow-md">
                {/* Header Card: Trạng thái và Ngày tháng */}
                <CardHeader className="bg-slate-50 border-b p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-sm">
                      Mã đơn: <span className="text-primary">#{order._id.substring(order._id.length - 8).toUpperCase()}</span>
                    </span>
                    <span className="text-muted-foreground text-sm hidden sm:inline">|</span>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                    </span>
                  </div>
                  <Badge variant="secondary" className={`${statusStyle.color} border-none text-xs px-2.5 py-1 flex w-fit`}>
                    {statusStyle.icon} {order.status}
                  </Badge>
                </CardHeader>

                <CardContent className="p-0">
                  {/* Danh sách sản phẩm trong đơn */}
                  <div className="p-4 space-y-4">
                    {order.items.map((item: any, index: number) => {
                      // Xử lý an toàn: Nếu sản phẩm đã bị Admin xóa khỏi kho thì báo đã ngừng kinh doanh
                      const productName = item.productId?.name || "Sản phẩm đã ngừng kinh doanh";
                      const productImg = item.productId?.images?.[0];

                      return (
                        <div key={index} className="flex gap-4">
                          <div className="w-16 h-16 bg-white rounded-md border overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {/* NẾU CÓ ẢNH THÌ HIỆN ẢNH, KHÔNG THÌ HIỆN ICON CÁI HỘP */}
                            {productImg ? (
                              <img src={productImg} alt={productName} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-8 h-8 text-slate-300" />
                            )}
                          </div>
                          <div className="flex-1 flex flex-col justify-between">
                            <h4 className="font-medium text-sm line-clamp-2">{productName}</h4>
                            <div className="flex justify-between items-center text-sm mt-2">
                              <span className="text-muted-foreground">x{item.quantity}</span>
                              <span className="font-semibold text-red-600">{(item.price).toLocaleString('vi-VN')}đ</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer Card: Tổng tiền */}
                  <div className="bg-slate-50/50 p-4 border-t flex justify-end items-center gap-4">
                    <span className="text-sm text-muted-foreground">Thành tiền:</span>
                    <span className="text-xl font-bold text-red-600">{order.totalPrice.toLocaleString('vi-VN')}đ</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}