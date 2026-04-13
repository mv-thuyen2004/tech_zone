"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, Ticket } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "@/store/useAuth";

interface Voucher {
  _id: string;
  code: string;
  discountType: "fixed" | "percent";
  discountValue: number;
  usedCount: number;
  usageLimit: number;
  expiryDate: string;
}

export default function AdminVouchers() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(true);
  const { token } = useAuth();
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  // State cho form tạo mới
  const [newVoucher, setNewVoucher] = useState({
    code: "", discountType: "fixed", discountValue: "", minOrderValue: "", expiryDate: "", usageLimit: "10"
  });

  const fetchVouchers = async () => {
    if (!token) return;
    try {
      const { data } = await axios.get(`${apiBase}/vouchers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVouchers(data.vouchers);
    } catch (err) { toast.error("Không thể tải danh sách voucher"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchVouchers(); }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Bạn cần đăng nhập admin");
      return;
    }
    try {
      const payload = {
        ...newVoucher,
        discountValue: Number(newVoucher.discountValue || 0),
        minOrderValue: Number(newVoucher.minOrderValue || 0),
        usageLimit: Number(newVoucher.usageLimit || 0),
      };

      await axios.post(`${apiBase}/vouchers`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Tạo mã thành công!");
      setNewVoucher({
        code: "",
        discountType: "fixed",
        discountValue: "",
        minOrderValue: "",
        expiryDate: "",
        usageLimit: "10",
      });
      fetchVouchers(); // Refresh list
    } catch (err: any) { toast.error(err.response?.data?.message || "Có lỗi xảy ra"); }
  };

  const handleDelete = async (id: string) => {
    if (!token) {
      toast.error("Bạn cần đăng nhập admin");
      return;
    }
    if (!confirm("Bạn có chắc muốn xóa mã này?")) return;
    try {
      await axios.delete(`${apiBase}/vouchers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Đã xóa!");
      setVouchers(vouchers.filter((v) => v._id !== id));
    } catch (err) { toast.error("Xóa thất bại"); }
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Ticket className="w-6 h-6" /> Quản lý Voucher
        </h1>
        <Button onClick={() => setShowCreateForm((prev) => !prev)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> {showCreateForm ? "Ẩn form thêm voucher" : "Thêm voucher"}
        </Button>
      </div>

      {/* Form thêm mới */}
      {showCreateForm && (
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleCreate} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
              <div>
                <label className="text-xs font-bold uppercase">Mã (VD: TET2026)</label>
                <Input required value={newVoucher.code} onChange={e => setNewVoucher({...newVoucher, code: e.target.value.toUpperCase()})} />
              </div>
              <div>
                <label className="text-xs font-bold uppercase">Loại</label>
                <select className="w-full h-10 border rounded-md px-2" value={newVoucher.discountType} onChange={e => setNewVoucher({...newVoucher, discountType: e.target.value})}>
                  <option value="fixed">Tiền mặt (đ)</option>
                  <option value="percent">Phần trăm (%)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase">Giá trị giảm</label>
                <Input type="number" inputMode="numeric" required value={newVoucher.discountValue} onChange={e => setNewVoucher({...newVoucher, discountValue: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold uppercase">Đơn tối thiểu</label>
                <Input type="number" inputMode="numeric" value={newVoucher.minOrderValue} onChange={e => setNewVoucher({...newVoucher, minOrderValue: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold uppercase">Ngày hết hạn</label>
                <Input type="date" required value={newVoucher.expiryDate} onChange={e => setNewVoucher({...newVoucher, expiryDate: e.target.value})} />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" /> Thêm voucher
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Bảng danh sách */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Giảm</TableHead>
              <TableHead>Đã dùng</TableHead>
              <TableHead>Hết hạn</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vouchers.map((v) => (
              <TableRow key={v._id}>
                <TableCell className="font-bold text-blue-600">{v.code}</TableCell>
                <TableCell>
                  {v.discountValue.toLocaleString()} {v.discountType === 'percent' ? '%' : 'đ'}
                </TableCell>
                <TableCell>{v.usedCount} / {v.usageLimit}</TableCell>
                <TableCell>{new Date(v.expiryDate).toLocaleDateString('vi-VN')}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(v._id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}