"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/store/useCart"; // Import cái store vừa tạo
import Link from "next/link";

interface ProductProps {
  product: {
    _id: string;
    name: string;
    price: number;
    slug: string;
    category: string;
    images: string[];
    compatibleModels: string[];
  };
}

export default function ProductCard({ product }: ProductProps) {
    const addItem = useCart((state) => state.addItem); // Lấy hàm addItem từ store
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all group border-none bg-card">
      <Link href={`/product/${product.slug}`}>
        <div className="aspect-square bg-slate-100 relative overflow-hidden">
          <img 
            // Nếu có ảnh thì hiện, không có thì lấy ảnh từ Unsplash theo từ khóa "tech" hoặc "phone"
            src={product.images && product.images[0] ? product.images[0] : `https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=300&auto=format&fit=crop`} 
            alt={product.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
          <Badge className="absolute top-2 left-2 bg-white/80 text-black backdrop-blur-md" variant="outline">
            {product.category}
          </Badge>
        </div>
      </Link>
      <CardContent className="p-4">
        <h3 className="font-medium text-sm line-clamp-2 min-h-[40px] mb-2">{product.name}</h3>
        <p className="text-lg font-bold text-red-600">
          {product.price.toLocaleString('vi-VN')}đ
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
            onClick={() => addItem(product)} // Bấm cái là bay vào giỏ!
            className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
        >
        Thêm vào giỏ
      </Button>
      </CardFooter>
    </Card>
  );
}