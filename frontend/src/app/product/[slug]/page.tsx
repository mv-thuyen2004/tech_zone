import RecommendedProducts from "@/components/product/RecommendedProducts";
import { Badge } from "@/components/ui/badge";
import AddToCartDetail from "@/components/product/AddToCartDetail";
import { notFound } from "next/navigation";
import { Star } from "lucide-react"; // Đã import thêm Star
import ProductReviews from "@/components/product/ProductReviews";

async function getProduct(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${slug}`, { 
    cache: 'no-store' 
  });
  
  if (!res.ok) return null;
  return res.json();
}

export default async function ProductDetailPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.slug);

  if (!product) {
    return notFound();
  }

  const imageUrl = product.images && product.images[0] 
    ? product.images[0] 
    : "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop";

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      
      <div className="grid md:grid-cols-2 gap-12 mb-16">
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

          {/* HÀNG SAO ĐÁNH GIÁ (Đã fix màu chuẩn) */}
          <div className="flex items-center gap-1 mb-4">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${product.rating >= star ? "text-yellow-400" : "text-slate-300"}`}
                  fill={product.rating >= star ? "currentColor" : "none"} // Fix lõi không lên màu
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground ml-2">
              ({product.numReviews || 0} đánh giá)
            </span>
          </div>
          
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
            <AddToCartDetail product={product} />
          </div>
        </div>
      </div>

      {/* TÁCH HẲN KHU VỰC BÌNH LUẬN XUỐNG DƯỚI ĐỂ TRÀN VIỀN MÀN HÌNH */}
      <div className="h-4" />
      <ProductReviews productId={product._id} reviews={product.reviews} />
      <div className="h-4" />
      {/* Sản phẩm gợi ý */}
      <div className="pt-16 mt-16 "> 
        <RecommendedProducts productId={product._id} />
      </div>

    </div>
  );
}