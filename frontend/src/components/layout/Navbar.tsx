"use client";

import Link from "next/link";
import { ShoppingCart, Search, Menu, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/store/useCart";
import { useAuth } from "@/store/useAuth";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  // 1. Chỉ lấy dữ liệu từ Zustand, nếu không có thì trả về undefined
  const userCart = useCart((state) => state.currentUserId ? state.carts[state.currentUserId] : undefined);

  // 2. Gán mảng rỗng ở ngoài Component để an toàn tuyệt đối
  const items = userCart || [];
  const { user, isAuthenticated, logout } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  
  const pathname = usePathname();
  const router = useRouter();
  const [keyword, setKeyword] = useState("");

  useEffect(() => setIsMounted(true), []);
  
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      router.push(`/?keyword=${encodeURIComponent(keyword.trim())}`);
    } else {
      router.push("/");
    }
  };

  const handleCartClick = () => {
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      router.push("/cart");
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/"); // Đá về trang chủ sau khi đăng xuất cho an toàn
  };

  return (
    <nav className="border-b bg-background sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        
        {/* KHỐI 1: LOGO VÀ MENU LINKS (Đã gom vào chung 1 khối) */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/" className="font-bold text-xl tracking-tight">
            Tech<span className="text-primary">Zone</span>
          </Link>

          {/* MENU LINKS NẰM NGAY CẠNH LOGO */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium ml-4">
            <Link href="/contact" className="hover:text-primary transition-colors">Liên hệ</Link>
          </div>
        </div>

        {/* KHỐI 2: FORM TÌM KIẾM (Đổi thành lg:flex để tránh đè menu trên iPad) */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden lg:flex items-center space-x-2">
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

        {/* KHỐI 3: USER & GIỎ HÀNG */}
        <div className="flex items-center gap-2 md:gap-4">
          {isMounted && isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium hidden sm:block">
                Chào, <span className="text-primary">{user?.fullName}</span>
                {user?.role === 'admin' && <span className="ml-1 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">Admin</span>}
              </span>
              <Link href="/profile">
                <Button variant="ghost" className="text-muted-foreground hover:text-primary px-2">
                  Hồ sơ
                </Button>
              </Link>
              <Link href="/my-orders">
                <Button variant="ghost" className="text-muted-foreground hover:text-primary">
                  Đơn mua
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Đăng xuất">
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
          
          <Button 
            variant="outline" 
            size="icon" 
            className="relative border-none shadow-none"
            onClick={handleCartClick}
          >
            <ShoppingCart className="h-6 w-6" />
            {isMounted && totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Button>
        </div>
      </div>
    </nav>
  );
}