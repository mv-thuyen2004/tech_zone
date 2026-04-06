"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/store/useAuth";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CheckCircle2, Truck, XCircle, Clock } from "lucide-react";

const TABS = ['Chờ xác nhận', 'Đang giao hàng', 'Đã giao thành công', 'Đã hủy'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(TABS[0]); // Mặc định mở tab Chờ xác nhận
  const { token } = useAuth();

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/orders`, {
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

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  // Hàm cập nhật trạng thái (Bấm xong là đơn tự chuyển Tab)
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (!window.confirm(`Chuyển đơn hàng này sang "${newStatus}"?`)) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        ));
      } else {
        alert("Cập nhật trạng thái thất bại");
      }
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
    }
  };

  // Lọc đơn hàng theo Tab hiện tại đang chọn
  const filteredOrders = orders.filter(order => order.status === activeTab);

  // Hàm đếm số lượng đơn của từng trạng thái để hiển thị lên Tab
  const getOrderCount = (status: string) => orders.filter(o => o.status === status).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Quản lý Đơn hàng</h1>
        <p className="text-muted-foreground">Theo dõi, duyệt đơn và cập nhật trạng thái vận chuyển.</p>
      </div>

      {/* THANH ĐIỀU HƯỚNG TABS */}
      <div className="flex overflow-x-auto gap-2 border-b pb-2 scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab 
                ? 'bg-primary text-white shadow-md' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              activeTab === tab ? 'bg-white/20' : 'bg-slate-200 text-slate-500'
            }`}>
              {getOrderCount(tab)}
            </span>
          </button>
        ))}
      </div>

      {/* BẢNG DỮ LIỆU */}
      <Card className="border-none shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Mã đơn</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Ngày đặt</TableHead>
              <TableHead className="text-right">Tổng tiền</TableHead>
              <TableHead className="text-center">Thao tác duyệt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">Đang tải dữ liệu...</TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-16 text-muted-foreground flex-col items-center">
                  <div className="text-lg font-medium text-slate-400">Trống</div>
                  <p className="text-sm">Không có đơn hàng nào ở trạng thái này.</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order._id}>
                  {/* Mã đơn rút gọn */}
                  <TableCell className="font-medium">
                    #{order._id.substring(order._id.length - 6).toUpperCase()}
                  </TableCell>
                  
                  {/* Thông tin khách */}
                  <TableCell>
                    <div className="font-semibold">{order.shippingInfo?.fullName || order.userId?.fullName}</div>
                    <div className="text-xs text-muted-foreground">{order.shippingInfo?.phone}</div>
                  </TableCell>
                  
                  {/* Ngày đặt */}
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                  </TableCell>
                  
                  {/* Tổng tiền */}
                  <TableCell className="text-right font-bold text-red-600">
                    {order.totalPrice.toLocaleString('vi-VN')}đ
                  </TableCell>
                  
                  {/* CỘT THAO TÁC THÔNG MINH */}
                  <TableCell className="text-center">
                    
                    {/* Nếu đang ở Tab Chờ xác nhận */}
                    {order.status === 'Chờ xác nhận' && (
                      <div className="flex justify-center gap-2">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-green-600" onClick={() => handleStatusChange(order._id, 'Đang giao hàng')}>
                          <Truck className="w-4 h-4 mr-1" /> Giao hàng
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => handleStatusChange(order._id, 'Đã hủy')}>
                          Hủy
                        </Button>
                      </div>
                    )}

                    {/* Nếu đang ở Tab Đang giao hàng */}
                    {order.status === 'Đang giao hàng' && (
                      <div className="flex justify-center gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-green-600" onClick={() => handleStatusChange(order._id, 'Đã giao thành công')}>
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Hoàn thành
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => handleStatusChange(order._id, 'Đã hủy')}>
                          Hủy
                        </Button>
                      </div>
                    )}

                    {/* Nếu đang ở Tab Thành công hoặc Đã hủy (Chỉ xem, không cho sửa nữa) */}
                    {(order.status === 'Đã giao thành công' || order.status === 'Đã hủy') && (
                      <Badge variant="outline" className={order.status === 'Đã giao thành công' ? 'text-green-600 border-green-200' : 'text-red-600 border-red-200'}>
                        {order.status === 'Đã giao thành công' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                        Đã chốt
                      </Badge>
                    )}

                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}