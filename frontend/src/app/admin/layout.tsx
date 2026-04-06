"use client";
import { useAuth } from "@/store/useAuth";
import { usePathname, useRouter } from "next/navigation"; // Thêm usePathname
import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, PlusCircle, Package, Home, LogOut } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname(); // Kích hoạt radar dò đường dẫn
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (isMounted && (!isAuthenticated || user?.role !== "admin")) {
      router.push("/");
    }
  }, [isMounted, isAuthenticated, user, router]);

  if (!isMounted || !isAuthenticated || user?.role !== "admin") return null;

  // Danh sách Menu
  const menuItems = [
    { href: "/admin/dashboard", icon: <LayoutDashboard className="h-5 w-5" />, label: "Dashboard" },
    { href: "/admin/add-product", icon: <PlusCircle className="h-5 w-5" />, label: "Thêm sản phẩm" },
    { href: "/admin/products", icon: <Package className="h-5 w-5" />, label: "Quản lý kho" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 bg-white border-r hidden md:block">
        <div className="p-6 font-bold text-xl text-primary">TechZone Admin</div>
        <nav className="space-y-1 px-4">
          
          {/* Render Menu động */}
          {menuItems.map((item) => {
            // Kiểm tra xem link của menu có khớp với link trên trình duyệt không
            const isActive = pathname === item.href; 
            
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                // Nếu đang Active thì tô nền đen (hoặc xanh), chữ trắng. Nếu không thì nền trong suốt, chữ xám
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow" // Class đang bôi đen
                    : "text-muted-foreground hover:bg-slate-100 hover:text-foreground" 
                }`}
              >
                {item.icon} {item.label}
              </Link>
            );
          })}
          
          <div className="pt-4 mt-4 border-t space-y-1">
            <Link href="/" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:bg-slate-100">
              <Home className="h-5 w-5" /> Quay lại Web
            </Link>
            <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 transition-colors">
              <LogOut className="h-5 w-5" /> Đăng xuất
            </button>
          </div>
        </nav>
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}