"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/store/useAuth";

export default function EditProductPage() {
  const { token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const productId = params.id; // Lấy ID từ trên URL

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [image, setImage] = useState<File | null>(null);
  const [currentImage, setCurrentImage] = useState(""); // Lưu ảnh cũ để hiển thị
  
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    compatibleModels: "",
    tags: "",
  });

  // 1. Tự động kéo dữ liệu cũ về khi mở trang
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`);
        if (!res.ok) throw new Error("Không tìm thấy sản phẩm");
        const data = await res.json();
        
        // Đổ dữ liệu vào Form (Biến mảng thành chuỗi có dấu phẩy)
        setFormData({
          name: data.name,
          price: data.price.toString(),
          category: data.category,
          description: data.description || "",
          compatibleModels: data.compatibleModels?.join(", ") || "",
          tags: data.tags?.join(", ") || "",
        });
        setCurrentImage(data.images?.[0] || "");
      } catch (error) {
        alert("Lỗi tải thông tin sản phẩm!");
      } finally {
        setFetching(false);
      }
    };
    if (productId) fetchProduct();
  }, [productId]);

  // 2. Gửi dữ liệu cập nhật
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrls = undefined; // Mặc định không gửi mảng ảnh mới

      // Nếu người dùng chọn ảnh mới, thì mới up lên Cloudinary
      if (image) {
        const imgFormData = new FormData();
        imgFormData.append("image", image);
        const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
          method: "POST",
          body: imgFormData,
        });
        if (!uploadRes.ok) throw new Error("Upload ảnh mới thất bại");
        const uploadData = await uploadRes.json();
        imageUrls = [uploadData.imageUrl]; // Cập nhật mảng ảnh
      }

      // Gửi dữ liệu đã sửa lên API (Dùng method PUT)
      const productRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          images: imageUrls, // Nếu không chọn ảnh mới, giá trị này là undefined (Backend sẽ giữ ảnh cũ)
          compatibleModels: formData.compatibleModels.split(",").map(m => m.trim()).filter(Boolean),
          tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
          slug: formData.name.toLowerCase().replace(/ /g, "-") 
        }),
      });

      if (productRes.ok) {
        alert("Cập nhật sản phẩm thành công!");
        router.push("/admin/products"); // Đá về lại trang kho hàng
      } else {
        const err = await productRes.json();
        throw new Error(err.message || "Cập nhật thất bại");
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="text-center py-20">Đang tải dữ liệu sản phẩm...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">Chỉnh Sửa Sản Phẩm</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tên sản phẩm</label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Giá (VNĐ)</label>
                  <Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Danh mục</label>
                  <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Dòng máy hỗ trợ</label>
                <Input value={formData.compatibleModels} onChange={e => setFormData({...formData, compatibleModels: e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tags (Từ khóa)</label>
                <Input value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Mô tả sản phẩm</label>
                <Textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
                <label className="text-sm font-medium block">Ảnh sản phẩm</label>
                <div className="flex items-center gap-4">
                  {currentImage && (
                    <img src={currentImage} alt="Current" className="w-20 h-20 object-cover rounded border" />
                  )}
                  <div className="flex-1 space-y-2">
                    <p className="text-xs text-muted-foreground">Chọn ảnh mới nếu muốn thay thế ảnh hiện tại.</p>
                    <Input type="file" accept="image/*" onChange={e => setImage(e.target.files?.[0] || null)} />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button type="button" variant="outline" className="w-1/3 h-12" onClick={() => router.push("/admin/products")}>Hủy bỏ</Button>
              <Button type="submit" className="w-2/3 h-12 text-base" disabled={loading}>
                {loading ? "Đang xử lý..." : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}