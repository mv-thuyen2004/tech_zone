"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/store/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "react-hot-toast";
import { Search, Shield, User as UserIcon, Trash2 } from "lucide-react";

type Role = "user" | "admin";

interface Account {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  role: Role;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const fetchUsers = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Không thể tải danh sách tài khoản");
      const data = await res.json();
      setUsers(data);
    } catch (error: any) {
      toast.error(error.message || "Lỗi tải tài khoản");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const filteredUsers = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return users;

    return users.filter((u) =>
      [u.fullName, u.email, u.phone || "", u.address || "", u.role]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [users, keyword]);

  const handleUpdateRole = async (account: Account, role: Role) => {
    if (!token) return;
    if (account.role === role) return;

    try {
      const res = await fetch(`${apiBase}/admin/users/${account._id}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Cập nhật quyền thất bại");

      setUsers((prev) => prev.map((u) => (u._id === account._id ? { ...u, role } : u)));
      toast.success("Cập nhật quyền thành công");
    } catch (error: any) {
      toast.error(error.message || "Cập nhật quyền thất bại");
    }
  };

  const handleDeleteUser = async (account: Account) => {
    if (!token) return;
    if (account._id === currentUser?._id) {
      toast.error("Không thể tự xóa tài khoản đang đăng nhập");
      return;
    }

    const confirmDelete = window.confirm(`Bạn có chắc muốn xóa tài khoản ${account.fullName}?`);
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${apiBase}/admin/users/${account._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Xóa tài khoản thất bại");

      setUsers((prev) => prev.filter((u) => u._id !== account._id));
      toast.success("Đã xóa tài khoản");
    } catch (error: any) {
      toast.error(error.message || "Xóa tài khoản thất bại");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Quản lý tài khoản</h1>
        <div className="text-sm text-muted-foreground">Tổng tài khoản: {filteredUsers.length}</div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm theo tên, email, số điện thoại..."
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <div className="bg-white rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Họ tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Số điện thoại</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                  Đang tải danh sách tài khoản...
                </TableCell>
              </TableRow>
            )}

            {!loading && filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                  Không tìm thấy tài khoản nào
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              filteredUsers.map((account) => (
                <TableRow key={account._id}>
                  <TableCell className="font-medium">{account.fullName || "-"}</TableCell>
                  <TableCell>{account.email}</TableCell>
                  <TableCell>{account.phone || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={account.role === "admin" ? "default" : "secondary"}>
                      {account.role === "admin" ? "Admin" : "User"}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(account.createdAt).toLocaleDateString("vi-VN")}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateRole(account, account.role === "admin" ? "user" : "admin")}
                      >
                        {account.role === "admin" ? (
                          <>
                            <UserIcon className="w-4 h-4 mr-1" /> Chuyển User
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4 mr-1" /> Lên Admin
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteUser(account)}
                        disabled={account._id === currentUser?._id}
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Xóa
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
