"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { History } from "lucide-react";

const HISTORY_KEY = "techzone-view-history";

export default function HistoryBasedRecommendations() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistoryRecommendations = async () => {
      try {
        const raw = localStorage.getItem(HISTORY_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        const viewedProductIds: string[] = Array.isArray(parsed)
          ? parsed.filter((id) => typeof id === "string").slice(0, 20)
          : [];

        if (viewedProductIds.length < 2) {
          setProducts([]);
          return;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/recommend/history`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ viewedProductIds, limit: 10 }),
        });

        if (!res.ok) throw new Error("Không thể tải gợi ý theo lịch sử xem");

        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Lỗi tải gợi ý lịch sử xem:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoryRecommendations();
  }, []);

  if (loading) return null;
  if (products.length === 0) return null;

  return (
    <section className="mt-10 pt-8 border-t border-slate-200">
      <div className="flex items-center gap-3 mb-6">
        
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Gợi ý cho bạn</h2>
          <p className="text-muted-foreground text-sm mt-1">Các sản phẩm tương tự dựa trên những gì bạn đã xem gần đây</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {products.map((product) => (
          <div key={product._id} className="animate-in fade-in slide-in-from-bottom-3 duration-500">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
