import { Badge } from "@/components/ui/badge";
import AddToCartDetail from "@/components/product/AddToCartDetail";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

// Hàm gọi API lấy 1 sản phẩm theo slug
async function getProduct(slug: string) {
  // Đừng quên đổi port 3000 thành port Backend của bạn (vd: 5000) nếu cần
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${slug}`, { 
    cache: 'no-store' // Luôn lấy data mới nhất
  });
  
  if (!res.ok) return null;
  return res.json();
}

// Next.js 15: params là một Promise
export default async function ProductDetailPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.slug);

  // Nếu nhập sai link, đá sang trang 404 (Not Found)
  if (!product) {
    return notFound();
  }

  // Lấy ảnh hiển thị (Ưu tiên link Cloudinary, nếu không có thì dùng placeholder)
  const imageUrl = product.images && product.images[0] 
    ? product.images[0] 
    : "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop";

  return (
    <div className="max-w-6xl mx-auto py-8">
      <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Quay lại trang chủ
      </Link>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Cột trái: Hình ảnh */}
        <div className="bg-muted rounded-3xl overflow-hidden aspect-square relative flex items-center justify-center p-8">
          <img 
            src={imageUrl} 
            alt={product.name} 
            className="object-cover w-full h-full rounded-2xl shadow-sm"
          />
        </div>

        {/* Cột phải: Thông tin */}
        <div className="flex flex-col justify-center">
          <Badge variant="secondary" className="w-fit mb-4 text-sm px-3 py-1">
            {product.category}
          </Badge>
          
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            {product.name}
          </h1>
          
          <p className="text-4xl font-extrabold text-red-600 mb-6">
            {product.price.toLocaleString('vi-VN')}đ
          </p>

          <div className="space-y-4 mb-8">
            <h3 className="font-semibold text-lg">Dòng máy tương thích:</h3>
            <div className="flex flex-wrap gap-2">
              {product.compatibleModels?.map((model: string) => (
                <Badge key={model} variant="outline" className="text-sm py-1.5 px-3">
                  {model}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <h3 className="font-semibold text-lg">Mô tả sản phẩm:</h3>
            <p className="text-muted-foreground leading-relaxed">
              {product.description || "Chưa có mô tả chi tiết cho sản phẩm này. TechZone cam kết hàng chính hãng 100%, bảo hành lỗi 1 đổi 1 trong 30 ngày."}
            </p>
          </div>

          <div className="pt-6 border-t">
            {/* Nhúng Client Component Nút bấm vào đây */}
            <AddToCartDetail product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}