"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/store/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, ShoppingCart, Users, DollarSign } from "lucide-react";
// Import các component của thư viện vẽ biểu đồ
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    chartData: [],
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
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

  if (loading) {
    return <div className="text-center py-20 text-muted-foreground animate-pulse">Đang tải dữ liệu tổng quan...</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Tổng quan hệ thống</h1>
      
      {/* 4 THẺ THỐNG KÊ (Giữ nguyên) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
            <div className="p-2 bg-green-100 rounded-full">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString('vi-VN')}đ</div>
            <p className="text-xs text-muted-foreground mt-1">Tổng tiền từ các đơn hàng</p>
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
            <div className="text-2xl font-bold">+{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">Đơn hàng trên hệ thống</p>
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
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">Mặt hàng trong kho</p>
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
            <div className="text-2xl font-bold">+{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Người dùng đã đăng ký</p>
          </CardContent>
        </Card>
      </div>

      {/* KHU VỰC CHIA 2 CỘT: BIỂU ĐỒ & BẢNG ĐƠN HÀNG */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* CỘT TRÁI (Chiếm 4 phần): BIỂU ĐỒ CỘT */}
        <Card className="border-none shadow-sm lg:col-span-4">
          <CardHeader>
            <CardTitle>Phân bổ sản phẩm</CardTitle>
            <CardDescription>Số lượng sản phẩm hiện có theo từng danh mục</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {stats.chartData.length > 0 ? (
              // SỬA Ở ĐÂY: Loại bỏ class h-[300px] gây lỗi và truyền thẳng height={300} vào ResponsiveContainer
              <div className="w-full mt-4">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="total" fill="#0f172a" radius={[4, 4, 0, 0]} name="Số lượng" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">Chưa có dữ liệu sản phẩm</div>
            )}
          </CardContent>
        </Card>

        {/* CỘT PHẢI (Chiếm 3 phần): 5 ĐƠN HÀNG GẦN NHẤT */}
        <Card className="border-none shadow-sm lg:col-span-3">
          <CardHeader>
            <CardTitle>Đơn hàng mới nhất</CardTitle>
            <CardDescription>5 khách hàng vừa đặt mua</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentOrders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead className="text-right">Giá trị</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentOrders.map((order: any) => (
                    <TableRow key={order._id}>
                      <TableCell>
                        <div className="font-medium">{order.shippingInfo?.fullName || 'Khách ẩn danh'}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{order.shippingInfo?.address}</div>
                      </TableCell>
                      <TableCell className="text-right font-bold text-red-600">
                        {order.totalPrice.toLocaleString('vi-VN')}đ
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-10 text-muted-foreground text-sm">Chưa có đơn hàng nào</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}