import ProductCard from "@/components/product/ProductCard";

async function getProducts() {
  // Thay port 3000 bằng port Backend của bạn (ví dụ 5000)
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
    next: { revalidate: 10 }, // Cập nhật lại data sau mỗi 10 giây
  });

  if (!res.ok) {
    throw new Error("Không thể tải danh sách sản phẩm");
  }

  return res.json();
}

export default async function HomePage() {
  const products = await getProducts();

  return (
    <div className="space-y-8">
      {/* Banner quảng cáo đơn giản */}
      <div className="bg-primary/10 rounded-2xl p-8 md:p-12 flex flex-col items-center text-center">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
          Phụ Kiện Điện Thoại <span className="text-primary">Chính Hãng</span>
        </h1>
        <p className="text-muted-foreground mt-4 max-w-lg">
          Ưu đãi cực khủng cho sinh viên HUMG. Giảm giá 20% cho tất cả các loại ốp lưng và cáp sạc.
        </p>
      </div>

      {/* Danh sách sản phẩm */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Sản phẩm mới nhất</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((product: any) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}