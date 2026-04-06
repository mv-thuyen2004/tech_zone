"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/store/useAuth";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Phone, MapPin, Lock, ShieldCheck, KeyRound } from "lucide-react";

export default function ProfilePage() {
  const { user, token, isAuthenticated, login } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (user) {
      setFullName(user.fullName || "");
      setPhone(user.phone || "");
      setAddress(user.address || "");
    }
  }, [isAuthenticated, user, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ fullName, phone, address })
      });

      const data = await res.json();

      if (res.ok) {
        alert("🎉 Cập nhật thông tin thành công!");
        login(data, token!); 
      } else {
        alert(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      return alert("❌ Vui lòng nhập mật khẩu hiện tại!");
    }
    if (newPassword !== confirmPassword) {
      return alert("❌ Mật khẩu xác nhận không khớp!");
    }
    if (newPassword.length < 6) {
      return alert("❌ Mật khẩu mới phải có ít nhất 6 ký tự!");
    }

    setPassLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword }) 
      });

      if (res.ok) {
        alert("🔒 Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới nhé.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await res.json();
        alert(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ");
    } finally {
      setPassLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Hồ sơ cá nhân</h1>
        <p className="text-muted-foreground">Quản lý thông tin bảo mật và địa chỉ giao hàng của bạn.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* CỘT 1: THÔNG TIN CÁ NHÂN */}
        <Card className="border-none shadow-md h-fit">
          <CardHeader className="bg-slate-50 border-b rounded-t-xl pb-4">
            <CardTitle className="flex items-center text-lg">
              <User className="w-5 h-5 mr-2 text-primary" /> Thông tin cơ bản
            </CardTitle>
            <CardDescription>Email không thể thay đổi để đảm bảo bảo mật.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Email đăng nhập</label>
                <Input value={user?.email || ""} disabled className="bg-slate-100 cursor-not-allowed text-slate-500" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Họ và Tên</label>
                <Input 
                  required 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  placeholder="Nhập họ và tên..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Số điện thoại</label>
                <div className="relative">
                  <Input 
                    className="pl-10" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    placeholder="Ví dụ: 0987654321"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Địa chỉ giao hàng mặc định</label>
                <div className="relative">

                  <Input 
                    className="pl-10" 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                    placeholder="Số nhà, Đường, Phường..."
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full mt-2">
                {loading ? "Đang lưu..." : "Lưu thông tin"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* CỘT 2: ĐỔI MẬT KHẨU */}
        <Card className="border-none shadow-md h-fit">
          <CardHeader className="bg-red-50/50 border-b rounded-t-xl pb-4">
            <CardTitle className="flex items-center text-lg text-red-600">
              <ShieldCheck className="w-5 h-5 mr-2" /> Đổi mật khẩu
            </CardTitle>
            <CardDescription>Cần xác minh mật khẩu hiện tại để thay đổi.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Mật khẩu hiện tại</label>
                <div className="relative">
                  
                  <Input 
                    type="password" 
                    required 
                    className="pl-10" 
                    value={currentPassword} 
                    onChange={(e) => setCurrentPassword(e.target.value)} 
                    placeholder="Nhập mật khẩu cũ..."
                  />
                </div>
              </div>

              <div className="border-t border-dashed my-4 pt-4">
                <label className="block text-sm font-medium mb-1 text-slate-700">Mật khẩu mới</label>
                <div className="relative">
                  <Input 
                    type="password" 
                    required 
                    minLength={6}
                    className="pl-10" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    placeholder="Ít nhất 6 ký tự..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Xác nhận mật khẩu mới</label>
                <div className="relative">
                  
                  <Input 
                    type="password" 
                    required 
                    className="pl-10" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    placeholder="Nhập lại mật khẩu mới..."
                  />
                </div>
              </div>

              <Button type="submit" variant="destructive" disabled={passLoading} className="w-full mt-2">
                {passLoading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
              </Button>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}