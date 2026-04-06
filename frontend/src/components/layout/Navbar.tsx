"use client";

import Link from "next/link";
import { ShoppingCart, Search, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/store/useCart";
import { useAuth } from "@/store/useAuth";
import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation"; // Thêm useRouter

export default function Navbar() {
  const items = useCart((state) => state.currentUserId ? (state.carts[state.currentUserId] || []) : []);
  const { user, isAuthenticated, logout } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  
  const pathname = usePathname();
  const router = useRouter(); // Khởi tạo router
  const [keyword, setKeyword] = useState(""); // State lưu từ khóa tìm kiếm

  useEffect(() => setIsMounted(true), []);
  
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  // Hàm xử lý khi người dùng bấm Enter hoặc click nút Kính lúp
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      // Đẩy từ khóa lên URL
      router.push(`/?keyword=${encodeURIComponent(keyword.trim())}`);
    } else {
      router.push("/");
    }
  };

  return (
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/" className="font-bold text-xl tracking-tight">
            Tech<span className="text-primary">Zone</span>
          </Link>
        </div>

        {/* THAY ĐỔI Ở ĐÂY: Biến thẻ div thành thẻ form */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:flex items-center space-x-2">
          <Input 
            type="search" 
            placeholder="Tìm kiếm ốp lưng, sạc, cường lực..." 
            className="w-full bg-muted"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <Button type="submit" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <div className="flex items-center gap-2 md:gap-4">
          {/* ... (Phần hiển thị User và Giỏ hàng giữ nguyên không đổi) ... */}
          {isMounted && isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium hidden sm:block">
                Chào, <span className="text-primary">{user?.fullName}</span>
                {user?.role === 'admin' && <span className="ml-1 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">Admin</span>}
              </span>
              <Button variant="ghost" size="icon" onClick={logout} title="Đăng xuất">
                <LogOut className="h-5 w-5 text-muted-foreground hover:text-red-600" />
              </Button>
            </div>
          ) : (
            isMounted && (
              <Link href="/login">
                <Button variant="outline" className="hidden sm:flex">Đăng nhập</Button>
                <Button variant="ghost" size="icon" className="sm:hidden"><User className="h-5 w-5" /></Button>
              </Link>
            )
          )}
          
          <Link href="/cart">
            <Button variant="outline" size="icon" className="relative border-none shadow-none">
              <ShoppingCart className="h-6 w-6" />
              {isMounted && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}