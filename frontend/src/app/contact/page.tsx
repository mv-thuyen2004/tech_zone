"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Giả lập thời gian gửi API mất 1 giây
    setTimeout(() => {
      alert("Cảm ơn bạn! Tin nhắn của bạn đã được gửi thành công. TechZone sẽ liên hệ lại sớm nhất.");
      setFormData({ name: "", email: "", message: "" });
      setLoading(false);
    }, 1000);

    // Ghi chú: Nếu bạn muốn lưu tin nhắn vào Database, bạn có thể gọi API Backend tại đây (giống như lúc tạo Sản phẩm)
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">Liên hệ với TechZone</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Bạn có câu hỏi, thắc mắc hay cần hỗ trợ bảo hành? Hãy để lại lời nhắn, đội ngũ của chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Cột thông tin liên hệ */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border-none shadow-sm bg-slate-50">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full text-primary">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Địa chỉ cửa hàng</h3>
                  <p className="text-muted-foreground mt-1">Đại học Mỏ - Địa chất<br />Số 18 Phố Viên, Bắc Từ Liêm, Hà Nội</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full text-primary">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Điện thoại</h3>
                  <p className="text-muted-foreground mt-1">0988.888.888<br />1900.1008 (CSKH)</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full text-primary">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Email hỗ trợ</h3>
                  <p className="text-muted-foreground mt-1">support@techzone.vn</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full text-primary">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Giờ làm việc</h3>
                  <p className="text-muted-foreground mt-1">Thứ 2 - Chủ Nhật<br />08:00 AM - 10:00 PM</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cột Form điền tin nhắn */}
        <div className="md:col-span-2">
          <Card className="border-none shadow-md">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-6">Gửi tin nhắn cho chúng tôi</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Họ và tên</label>
                    <Input 
                      placeholder="Nguyễn Văn A" 
                      required 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email của bạn</label>
                    <Input 
                      type="email" 
                      placeholder="name@example.com" 
                      required 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nội dung tin nhắn</label>
                  <Textarea 
                    placeholder="Bạn cần hỗ trợ vấn đề gì..." 
                    rows={6} 
                    required 
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  />
                </div>

                <Button type="submit" size="lg" className="w-full sm:w-auto px-8 h-12 text-base rounded-xl" disabled={loading}>
                  {loading ? "Đang gửi..." : (
                    <>
                      Gửi tin nhắn <Send className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}