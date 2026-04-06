"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/store/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, Users, DollarSign } from "lucide-react";

export default function AdminDashboard() {
  const { token } = useAuth(); // Lấy token để xác thực Admin
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);

  // Gọi API lấy dữ liệu thống kê
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu thống kê:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchStats();
  }, [token]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Tổng quan hệ thống</h1>
      
      {/* Các thẻ thống kê */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
            <div className="p-2 bg-green-100 rounded-full">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-24 bg-slate-200 animate-pulse rounded"></div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString('vi-VN')}đ</div>
                <p className="text-xs text-muted-foreground mt-1">Tổng tiền từ các đơn hàng</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đơn hàng</CardTitle>
            <div className="p-2 bg-blue-100 rounded-full">
              <ShoppingCart className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-16 bg-slate-200 animate-pulse rounded"></div>
            ) : (
              <>
                <div className="text-2xl font-bold">+{stats.totalOrders}</div>
                <p className="text-xs text-muted-foreground mt-1">Đơn hàng trên hệ thống</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sản phẩm</CardTitle>
            <div className="p-2 bg-orange-100 rounded-full">
              <Package className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-16 bg-slate-200 animate-pulse rounded"></div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                <p className="text-xs text-muted-foreground mt-1">Mặt hàng trong kho</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Khách hàng</CardTitle>
            <div className="p-2 bg-purple-100 rounded-full">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-16 bg-slate-200 animate-pulse rounded"></div>
            ) : (
              <>
                <div className="text-2xl font-bold">+{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground mt-1">Người dùng đã đăng ký</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Box chào mừng */}
      <div className="bg-primary/10 rounded-2xl p-8 text-center mt-8 border border-primary/20">
        <h2 className="text-xl font-bold mb-2 text-primary">Hệ thống đang hoạt động ổn định!</h2>
        <p className="text-muted-foreground">
          Bạn có thể truy cập mục Quản lý kho để thêm, sửa, xóa sản phẩm hoặc xem danh sách đơn hàng.
        </p>
      </div>
    </div>
  );
}