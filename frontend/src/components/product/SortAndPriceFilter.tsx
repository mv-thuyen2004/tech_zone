"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter, ArrowUpDown } from "lucide-react";

export default function SortAndPriceFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Lấy các state hiện tại từ URL
  const currentSort = searchParams.get("sort") || "newest";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";

  // Tính toán Range đang chọn dựa vào min/max trên URL
  let activePriceRange = "all";
  if (currentMaxPrice === "100000") activePriceRange = "under_100k";
  else if (currentMinPrice === "100000" && currentMaxPrice === "300000") activePriceRange = "100k_300k";
  else if (currentMinPrice === "300000" && currentMaxPrice === "500000") activePriceRange = "300k_500k";
  else if (currentMinPrice === "500000") activePriceRange = "over_500k";

  // Hàm update URL chung
  const updateFilters = (sort: string, minPrice: string, maxPrice: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (sort && sort !== "newest") params.set("sort", sort);
    else params.delete("sort");

    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");

    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");

    params.delete("page"); // Khi đổi bộ lọc thì luôn reset về trang 1
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilters(e.target.value, currentMinPrice, currentMaxPrice);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    let min = "", max = "";
    
    if (val === "under_100k") max = "100000";
    else if (val === "100k_300k") { min = "100000"; max = "300000"; }
    else if (val === "300k_500k") { min = "300000"; max = "500000"; }
    else if (val === "over_500k") min = "500000";
    
    updateFilters(currentSort, min, max);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mt-4 mb-8">
      {/* 1. Lọc theo khoảng giá */}
      <div className="flex items-center gap-2 bg-white border border-slate-200 hover:border-primary transition-colors rounded-xl px-3 py-2 shadow-sm">
        <Filter className="w-4 h-4 text-primary" />
        <select 
          value={activePriceRange} 
          onChange={handlePriceChange} 
          className="bg-transparent border-none outline-none text-sm font-medium text-slate-700 cursor-pointer pr-2"
        >
          <option value="all">Tất cả mức giá</option>
          <option value="under_100k">Dưới 100.000đ</option>
          <option value="100k_300k">100.000đ - 300.000đ</option>
          <option value="300k_500k">300.000đ - 500.000đ</option>
          <option value="over_500k">Trên 500.000đ</option>
        </select>
      </div>

      {/* 2. Sắp xếp kết quả */}
      <div className="flex items-center gap-2 bg-white border border-slate-200 hover:border-primary transition-colors rounded-xl px-3 py-2 shadow-sm">
        <ArrowUpDown className="w-4 h-4 text-primary" />
        <select 
          value={currentSort} 
          onChange={handleSortChange} 
          className="bg-transparent border-none outline-none text-sm font-medium text-slate-700 cursor-pointer pr-2"
        >
          <option value="newest">Sắp xếp: Mới nhất</option>
          <option value="price_asc">Giá: Thấp đến Cao</option>
          <option value="price_desc">Giá: Cao đến Thấp</option>
        </select>
      </div>
    </div>
  );
}