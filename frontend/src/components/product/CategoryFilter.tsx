"use client";

import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils"; // Hàm gộp class của Shadcn
import { LayoutGrid, Smartphone, ShieldCheck, Zap, BatteryCharging, Headphones, Cable } from "lucide-react";

// Định nghĩa danh mục kèm Icon để trông sinh động hơn
const CATEGORIES = [
  { name: "Tất cả", icon: <LayoutGrid className="w-4 h-4" /> },
  { name: "Ốp lưng", icon: <Smartphone className="w-4 h-4" /> },
  { name: "Kính cường lực", icon: <ShieldCheck className="w-4 h-4" /> },
  { name: "Cáp sạc", icon: <Cable className="w-4 h-4" /> },
  { name: "Củ sạc", icon: <Zap className="w-4 h-4" /> },
  { name: "Sạc dự phòng", icon: <BatteryCharging className="w-4 h-4" /> },
  { name: "Tai nghe", icon: <Headphones className="w-4 h-4" /> },
];

export default function CategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentCategory = searchParams.get("category");
  const currentKeyword = searchParams.get("keyword");

  const handleCategoryClick = (category: string) => {
    const params = new URLSearchParams();
    if (currentKeyword) params.append("keyword", currentKeyword);
    if (category !== "Tất cả") params.append("category", category);
    
    // Thêm scroll: false để trang không bị nhảy lên đầu khi chọn filter
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 pt-2 px-2 scrollbar-hide snap-x">
  {CATEGORIES.map((cat) => {
    const isActive = currentCategory === cat.name || (!currentCategory && cat.name === "Tất cả");

    return (
      <button
        key={cat.name}
        onClick={() => handleCategoryClick(cat.name)}
        className={cn(
          // --- PHẦN THAY ĐỔI CHÍNH ---
          "flex items-center gap-3 px-8 py-3.5 rounded-2xl text-[15px] font-semibold transition-all duration-300 snap-start whitespace-nowrap border shadow-sm",
          // ---------------------------
          isActive 
            ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200 -translate-y-0.5" 
            : "bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-900 hover:bg-slate-50"
        )}
      >
        <span className={cn("transition-colors", isActive ? "text-orange-400" : "text-slate-400")}>
          {cat.icon}
        </span>
        {cat.name}
      </button>
    );
  })}
</div>
  );
}