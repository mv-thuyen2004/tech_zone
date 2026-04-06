"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { Sparkles } from "lucide-react"; // Thêm icon cho đẹp

export default function RecommendedProducts({ productId }: { productId: string }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/recommend/${productId}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (error) {
        console.error("Lỗi tải sản phẩm gợi ý:", error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) fetchRecommendations();
  }, [productId]);

  // UI 1: Hiệu ứng khung xương (Skeleton) khi đang chờ API load
  if (loading) {
    return (
      <div className="mt-20 pt-12 border-t border-slate-100">
        <div className="h-8 w-64 bg-slate-200 animate-pulse rounded-lg mb-8"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col gap-4">
              <div className="aspect-square bg-slate-100 animate-pulse rounded-2xl"></div>
              <div className="h-4 w-3/4 bg-slate-100 animate-pulse rounded-md"></div>
              <div className="h-4 w-1/2 bg-slate-100 animate-pulse rounded-md"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // UI 2: Ẩn hoàn toàn nếu không có sản phẩm nào chung form máy
  if (products.length === 0) return null;

  // UI 3: Giao diện chính thức cực xịn xò
  return (
    <div className="mt-32 pt-12  border-slate-200">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-orange-100 p-2.5 rounded-full shadow-sm">
          <Sparkles className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
            Thường được mua cùng
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Các phụ kiện tương thích hoàn hảo với thiết bị này
          </p>
        </div>
      </div>
      
      {/* Grid hiển thị danh sách sản phẩm với khoảng cách thoáng hơn */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product) => (
          <div key={product._id} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}