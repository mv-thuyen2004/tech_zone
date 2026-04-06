"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const login = useAuth((state) => state.login);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // Gọi API Backend (Nhớ thay port 5000 bằng port Backend của bạn)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Đăng nhập thất bại");
      }
      

      // // 1. Lưu user và token vào Zustand
      // login(data.user, data.token);

      // // 2. Phân luồng: Admin cho ra sau cánh gà, User cho ra mặt tiền
      // console.log("User role:", data.role); // Debug xem role trả về là gì
      // if (data.role === "admin") {
      //   router.push("/admin/dashboard");
      // } else {
      //   router.push("/");
      // }

      // Tự đóng gói object user từ dữ liệu phẳng của Backend
      const userToSave = {
        _id: data._id,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        phone: data.phone,
        address: data.address
      };

      // 1. Lưu vào Zustand (Truyền object vừa đóng gói và token)
      login(userToSave, data.token);

      // 2. Phân luồng dựa trên data.role trực tiếp
      if (data.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }


    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <Card className="w-[400px] shadow-lg border-none">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Đăng nhập TechZone</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input 
                type="email" 
                placeholder="admin@techzone.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Mật khẩu</label>
              <Input 
                type="password" 
                placeholder="********" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full text-base h-11">Đăng nhập</Button>
            
            <div className="text-center text-sm text-muted-foreground mt-4">
              Chưa có tài khoản? <Link href="/register" className="text-primary hover:underline">Đăng ký ngay</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}