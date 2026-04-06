import ProductCard from "@/components/product/ProductCard";
import CategoryFilter from "@/components/product/CategoryFilter";
import PaginationControl from "@/components/product/PaginationControl"; // Import component mới

// Nhận thêm tham số page
async function getProducts(keyword?: string, category?: string, page?: string) {
  const params = new URLSearchParams();
  
  if (keyword) params.append("keyword", keyword);
  if (category) params.append("category", category);
  if (page) params.append("page", page); // Gắn page vào request

  const url = `${process.env.NEXT_PUBLIC_API_URL}/products${params.toString() ? `?${params.toString()}` : ""}`;
  const res = await fetch(url, { cache: 'no-store' });

  if (!res.ok) throw new Error("Không thể tải danh sách sản phẩm");
  return res.json();
}

export default async function HomePage({ 
  searchParams 
}: { 
  searchParams: Promise<{ keyword?: string; category?: string; page?: string }> 
}) {
  const resolvedParams = await searchParams;
  const keyword = resolvedParams.keyword;
  const category = resolvedParams.category;
  const page = resolvedParams.page; // Lấy page từ URL
  
  // Dữ liệu giờ là một Object
  const data = await getProducts(keyword, category, page);
  const products = data.products || []; // Trích xuất mảng products

  return (
    <div className="space-y-8">
      {/* Ẩn Banner nếu người dùng đang tìm kiếm hoặc đang lọc danh mục */}
      {  (
        <div className="bg-primary/10 rounded-2xl p-8 md:p-12 flex flex-col items-center text-center">
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
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h2 className="text-2xl font-bold">
            {keyword ? `Kết quả tìm kiếm cho: "${keyword}"` : (category ? `Danh mục: ${category}` : "Sản phẩm mới nhất")}
          </h2>
          <CategoryFilter />
        </div>
        
        {products.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground mb-4">Rất tiếc, không tìm thấy sản phẩm nào phù hợp.</p>
          </div>
        ) : (
          <>
            {/* Lặp mảng products thay vì biến data */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map((product: any) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* NHÚNG NÚT PHÂN TRANG VÀO ĐÂY */}
            <PaginationControl page={data.page} pages={data.pages} />
          </>
        )}
      </div>
    </div>
  );
}