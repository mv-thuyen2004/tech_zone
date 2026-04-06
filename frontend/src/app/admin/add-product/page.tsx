"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/store/useAuth";

export default function AddProductPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    compatibleModels: "", // Nhập cách nhau bằng dấu phẩy
    tags:"",
    stock:0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return alert("Vui lòng chọn ảnh sản phẩm!");

    setLoading(true);
    try {
      // 1. Upload ảnh lên Cloudinary qua API đã làm
      const imgFormData = new FormData();
      imgFormData.append("image", image);

      const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
        method: "POST",
        body: imgFormData,
      });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) throw new Error("Upload ảnh thất bại");

      // 2. Gửi dữ liệu sản phẩm kèm Link ảnh về DB
      const productRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Gửi token để Backend biết là Admin
        },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          images: [uploadData.imageUrl],
          compatibleModels: formData.compatibleModels.split(",").map(m => m.trim()),
          tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean), 
          slug: formData.name.toLowerCase().replace(/ /g, "-") // Tạo slug đơn giản
        }),
      });

      if (productRes.ok) {
        alert("Thêm sản phẩm thành công!");
        setFormData({ name: "", price: "", category: "", description: "", compatibleModels: "", tags: "", stock: 0 });
        setImage(null);
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">Thêm Sản Phẩm Mới</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tên sản phẩm</label>
                <Input placeholder="Ví dụ: Ốp lưng iPhone 15 Pro Max" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Giá (VNĐ)</label>
                  <Input type="number" placeholder="250000" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Danh mục</label>
                  <Input placeholder="Ốp lưng, Sạc..." value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Dòng máy hỗ trợ (cách nhau bằng dấu phẩy)</label>
                <Input placeholder="iPhone 15, iPhone 14" value={formData.compatibleModels} onChange={e => setFormData({...formData, compatibleModels: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tags (Từ khóa gợi ý, cách nhau bằng dấu phẩy)</label>
                <Input placeholder="hot, sale, gaming, chong-soc..." value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mô tả sản phẩm</label>
                <Textarea placeholder="Mô tả chi tiết..." rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Ảnh sản phẩm</label>
                <Input type="file" accept="image/*" onChange={e => setImage(e.target.files?.[0] || null)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Số lượng tồn kho</label>
                <Input type="number" placeholder="100" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} required />
              </div>
            </div>
            <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
              {loading ? "Đang xử lý..." : "Lưu sản phẩm"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}