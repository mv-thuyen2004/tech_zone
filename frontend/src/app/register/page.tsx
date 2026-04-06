"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function RegisterPage() {

    //fullName, email, password, phone, address
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",

    phone: "",
    address: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Kiểm tra khớp mật khẩu ở phía Client trước khi gửi đi
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          address: formData.address
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Đăng ký thất bại");
      }

      // Đăng ký thành công -> Đẩy sang trang Login
      alert("Đăng ký thành công! Hãy đăng nhập để mua sắm.");
      router.push("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] py-10">
      <Card className="w-[450px] shadow-xl border-none">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Tham gia TechZone</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded border border-red-100">{error}</div>}
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Họ và tên</label>
              <Input 
                name="fullName"
                placeholder="Nguyễn Văn A" 
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input 
                name="email"
                type="email" 
                placeholder="name@example.com" 
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Mật khẩu</label>
              <Input 
                name="password"
                type="password" 
                placeholder="Tối thiểu 6 ký tự" 
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Xác nhận mật khẩu</label>
              <Input 
                name="confirmPassword"
                type="password" 
                placeholder="Nhập lại mật khẩu" 
                onChange={handleChange}
                required
              />
            </div>

            <Button type="submit" className="w-full text-base h-11" disabled={loading}>
              {loading ? "Đang xử lý..." : "Tạo tài khoản"}
            </Button>
            
            <div className="text-center text-sm text-muted-foreground mt-4">
              Đã có tài khoản? <Link href="/login" className="text-primary font-semibold hover:underline">Đăng nhập</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}