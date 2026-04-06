"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/store/useAuth";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Edit, PlusCircle, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";


export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  // State cho Phân trang & Tìm kiếm
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState(""); // Lưu text người dùng đang gõ
  const [keyword, setKeyword] = useState(""); // Lưu text khi bấm nút "Tìm kiếm"

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Gắn thêm page và keyword vào URL API
      let url = `${process.env.NEXT_PUBLIC_API_URL}/products?page=${page}`;
      if (keyword) {
        url += `&keyword=${encodeURIComponent(keyword)}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      
      const productsArray = data.products || []; 
      setProducts(productsArray);
      setTotalPages(data.pages || 1); // Lấy tổng số trang từ Backend
    } catch (error) {
      console.error("Lỗi tải sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  // Tự động gọi API mỗi khi [page] hoặc [keyword] thay đổi
  useEffect(() => {
    fetchProducts();
  }, [page, keyword]);

  // Xử lý khi bấm nút Tìm kiếm
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyword(searchInput); // Chốt từ khóa để useEffect tự động gọi lại API
    setPage(1); // Khi tìm kiếm thì reset về trang 1
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa "${name}" không? Hành động này không thể hoàn tác.`)) {
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        // Cập nhật lại danh sách trên màn hình ngay lập tức
        setProducts(products.filter((p) => p._id !== id));
        alert("Đã xóa thành công!");
      } else {
        const err = await res.json();
        alert(err.message || "Xóa thất bại");
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ");
    }
  };

  return (
    <div className="space-y-6">
      {/* Tiêu đề & Nút Thêm mới */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý kho hàng</h1>
          <p className="text-muted-foreground">Xem, sửa và xóa các sản phẩm hiện có trong hệ thống.</p>
        </div>
        <Link href="/admin/add-product">
          <Button className="bg-primary text-white">
            <PlusCircle className="mr-2 h-4 w-4" /> Thêm sản phẩm mới
          </Button>
        </Link>
      </div>

      {/* Thanh Tìm kiếm */}
      <Card className="p-4 border-none shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-96">
          <Input 
            placeholder="Tìm kiếm theo tên, danh mục, máy..." 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full"
          />
          <Button type="submit" variant="secondary" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>
        
        {/* Nút Xóa bộ lọc */}
        {keyword && (
          <Button 
            variant="ghost" 
            onClick={() => {
              setSearchInput("");
              setKeyword("");
              setPage(1);
            }}
          >
            Xóa tìm kiếm
          </Button>
        )}
      </Card>

      {/* Bảng dữ liệu */}
      <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[100px]">Hình ảnh</TableHead>
              <TableHead>Tên sản phẩm</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead className="text-right">Tồn kho</TableHead>
              <TableHead className="text-right">Giá bán</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Đang tải dữ liệu...</TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Không tìm thấy sản phẩm nào.</TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>
                    <div className="h-12 w-12 rounded-md bg-muted overflow-hidden border">
                      <img 
                        src={product.images?.[0] || "https://via.placeholder.com/50"} 
                        alt={product.name}
                        className="h-full w-full object-cover" 
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium line-clamp-2 max-w-[250px]">{product.name}</TableCell>
                  <TableCell>
                    <span className="bg-secondary px-2 py-1 rounded-md text-xs whitespace-nowrap">{product.category}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    {/* Hiển thị số lượng (Tồn kho) */}
                    <span className={`font-semibold ${product.stock <= 5 ? 'text-red-600' : 'text-slate-700'}`}>
                      {product.stock || 0}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-red-600 whitespace-nowrap">
                    {product.price.toLocaleString('vi-VN')}đ
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/edit-product/${product._id}`}>
                          <Button variant="outline" size="icon" title="Sửa sản phẩm">
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>
                      </Link>
                      <Button 
                          variant="outline" 
                          size="icon" 
                          title="Xóa sản phẩm"
                          className="hover:bg-red-50 hover:text-red-600"
                          onClick={() => handleDelete(product._id, product.name)}
                      >
                          <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Điều khiển Phân trang */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-4">
          <p className="text-sm text-muted-foreground">
            Hiển thị trang <span className="font-bold text-foreground">{page}</span> trên {totalPages}
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page <= 1} 
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Trước
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page >= totalPages} 
              onClick={() => setPage(page + 1)}
            >
              Sau <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}