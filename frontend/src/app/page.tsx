import ProductCard from "@/components/product/ProductCard";
import CategoryFilter from "@/components/product/CategoryFilter";
import SortAndPriceFilter from "@/components/product/SortAndPriceFilter"; // Import component mới
import PaginationControl from "@/components/product/PaginationControl"; 
import ChatWidget from "@/components/chat/ChatWidget";

// Thêm tham số minPrice, maxPrice, sort
async function getProducts(keyword?: string, category?: string, page?: string, minPrice?: string, maxPrice?: string, sort?: string) {
  const params = new URLSearchParams();
  
  if (keyword) params.append("keyword", keyword);
  if (category) params.append("category", category);
  if (page) params.append("page", page); 
  if (minPrice) params.append("minPrice", minPrice);
  if (maxPrice) params.append("maxPrice", maxPrice);
  if (sort) params.append("sort", sort);

  const url = `${process.env.NEXT_PUBLIC_API_URL}/products${params.toString() ? `?${params.toString()}` : ""}`;
  const res = await fetch(url, { cache: 'no-store' });

  if (!res.ok) throw new Error("Không thể tải danh sách sản phẩm");
  return res.json();
}

export default async function HomePage({ 
  searchParams 
}: { 
  searchParams: Promise<{ keyword?: string; category?: string; page?: string; minPrice?: string; maxPrice?: string; sort?: string }> 
}) {
  const resolvedParams = await searchParams;
  // Lấy hết các param từ URL ra
  const { keyword, category, page, minPrice, maxPrice, sort } = resolvedParams;
  
  const data = await getProducts(keyword, category, page, minPrice, maxPrice, sort);
  const products = data.products || []; 

  return (
    <div className="space-y-4">
      
      {(!keyword && !category && !minPrice && !maxPrice) && (
        <div className="bg-primary/10 rounded-2xl p-8 md:p-12 flex flex-col items-center text-center mb-8">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            Phụ Kiện Điện Thoại <span className="text-primary">Chính Hãng</span>
          </h1>
          <p className="text-muted-foreground mt-4 max-w-lg">
            Ưu đãi cực khủng cho sinh viên HUMG. Giảm giá 20% cho tất cả các loại ốp lưng và cáp sạc.
          </p>
        </div>
      )}

      {/* Vùng danh sách sản phẩm */}
      <div>
        <div className="flex flex-col mb-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold">
              {keyword ? `Tìm kiếm: "${keyword}"` : (category ? `Danh mục: ${category}` : "Tất cả sản phẩm")}
            </h2>
            <CategoryFilter />
          </div>
          
          {/* Nhúng thanh Lọc Giá và Sắp Xếp vào đây */}
          <SortAndPriceFilter />
        </div>
        
        {products.length === 0 ? (
          <div className="py-20 text-center bg-slate-50 border-2 border-dashed rounded-2xl">
            <p className="text-lg font-medium text-slate-700 mb-2">Không có sản phẩm nào phù hợp</p>
            <p className="text-sm text-slate-500">Thử thay đổi mức giá hoặc danh mục để tìm thấy sản phẩm bạn cần nhé.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map((product: any) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            <div className="mt-8">
              <PaginationControl page={data.page} pages={data.pages} />
            </div>
          </>
        )}
      </div>

      <section className="bg-slate-50 border-t border-slate-200 py-16 mt-8">
        <div className="container mx-auto px-4 max-w-4xl">
          
          {/* Tiêu đề thu hút */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Bạn Cần Tư Vấn? Hỏi AI Ngay!
            </h2>
            <p className="text-slate-500 mt-3 text-lg">
              Trợ lý ảo TechZone trực 24/7. Giải đáp mọi thắc mắc về giá cả, tồn kho và độ tương thích của phụ kiện.
            </p>
          </div>

          {/* Nhúng Khối Chat vào đây */}
          <ChatWidget />
          
        </div>
      </section>
    </div>
  );
}