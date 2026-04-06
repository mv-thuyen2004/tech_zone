"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/store/useAuth";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, PlusCircle } from "lucide-react";
import Link from "next/link";

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth(); // Lấy token để lấy quyền xóa

  // Hàm tải danh sách sản phẩm
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`);
      const data = await res.json();
      // Sắp xếp mới nhất lên đầu luôn cho tiện
      const sorted = data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setProducts(sorted);
    } catch (error) {
      console.error("Lỗi tải sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Hàm xử lý Xóa
  const handleDelete = async (id: string, name: string) => {
    // Bật hộp thoại xác nhận trước khi xóa
    if (!window.confirm(`Bạn có chắc chắn muốn xóa "${name}" không? Hành động này không thể hoàn tác.`)) {
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}` // Gửi thẻ Admin đi
        }
      });

      if (res.ok) {
        // Cập nhật lại danh sách trên màn hình ngay lập tức (xóa phần tử đó khỏi mảng)
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

      <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[100px]">Hình ảnh</TableHead>
              <TableHead>Tên sản phẩm</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead className="text-right">Giá bán</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Đang tải dữ liệu...</TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Chưa có sản phẩm nào trong kho.</TableCell>
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
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <span className="bg-secondary px-2 py-1 rounded-md text-xs">{product.category}</span>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-red-600">
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
    </div>
  );
}