"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/store/useAuth";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Package, Clock, Truck, CheckCircle2, XCircle, ShoppingBag, Star, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, token, isAuthenticated } = useAuth();
  const router = useRouter();

  const [reviewedItems, setReviewedItems] = useState<string[]>([]);
  
  // SỬA Ở ĐÂY: Thay vì Modal, ta dùng state để lưu ID của sản phẩm đang được mở form đánh giá
  const [activeReviewProductId, setActiveReviewProductId] = useState<string | null>(null);
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchMyOrders = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/myorders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (error) {
        console.error("Lỗi tải đơn hàng:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchMyOrders();
  }, [token, isAuthenticated, router]);

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'Chờ xác nhận': return { color: 'text-yellow-600 bg-yellow-100', icon: <Clock className="w-4 h-4 mr-1" /> };
      case 'Đang giao hàng': return { color: 'text-blue-600 bg-blue-100', icon: <Truck className="w-4 h-4 mr-1" /> };
      case 'Đã giao thành công': return { color: 'text-green-600 bg-green-100', icon: <CheckCircle2 className="w-4 h-4 mr-1" /> };
      case 'Đã hủy': return { color: 'text-red-600 bg-red-100', icon: <XCircle className="w-4 h-4 mr-1" /> };
      default: return { color: 'text-slate-600 bg-slate-100', icon: <Package className="w-4 h-4 mr-1" /> };
    }
  };

  // HÀM BẬT/TẮT FORM ĐÁNH GIÁ INLINE
  const toggleReviewForm = (productId: string) => {
    if (activeReviewProductId === productId) {
      // Nếu bấm lại vào nút của sản phẩm đang mở form -> Đóng form
      setActiveReviewProductId(null);
    } else {
      // Mở form cho sản phẩm mới, reset lại data
      setActiveReviewProductId(productId);
      setRating(5);
      setComment("");
    }
  };

  const handleSubmitReview = async (e: React.FormEvent, productId: string) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ rating, comment })
      });

      const data = await res.json();

      if (res.ok) {
        alert("🎉 Cảm ơn bạn đã đánh giá sản phẩm!");
        setReviewedItems((prev) => [...prev, productId]);
        setActiveReviewProductId(null); // Đóng form sau khi gửi thành công
        setRating(5);
        setComment("");
      } else {
        alert(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 animate-pulse text-muted-foreground">Đang lấy thông tin đơn hàng...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Đơn hàng của tôi</h1>
        <p className="text-muted-foreground">Quản lý và theo dõi trạng thái các sản phẩm bạn đã mua.</p>
      </div>

      {orders.length === 0 ? (
        <Card className="border-dashed border-2 bg-slate-50">
           <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="bg-slate-200 p-4 rounded-full mb-4">
              <ShoppingBag className="w-8 h-8 text-slate-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Bạn chưa có đơn hàng nào</h2>
            <p className="text-muted-foreground mb-6">Hãy dạo quanh cửa hàng và chọn cho mình những món đồ ưng ý nhé!</p>
            <Link href="/">
              <Button className="rounded-xl px-8">Tiếp tục mua sắm</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const statusStyle = getStatusDisplay(order.status);
            
            return (
              <Card key={order._id} className="border-none shadow-sm overflow-hidden transition-all hover:shadow-md">
                <CardHeader className="bg-slate-50 border-b p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-sm">
                      Mã đơn: <span className="text-primary">#{order._id.substring(order._id.length - 8).toUpperCase()}</span>
                    </span>
                    <span className="text-muted-foreground text-sm hidden sm:inline">|</span>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                    </span>
                  </div>
                  <Badge variant="secondary" className={`${statusStyle.color} border-none text-xs px-2.5 py-1 flex w-fit`}>
                    {statusStyle.icon} {order.status}
                  </Badge>
                </CardHeader>

                <CardContent className="p-0">
                  <div className="p-4 space-y-4">
                    {order.items.map((item: any, index: number) => {
                      const productId = item.productId?._id;
                      const productName = item.productId?.name || "Sản phẩm đã ngừng kinh doanh";
                      const productImg = item.productId?.images?.[0];
                      
                      const isReviewedFromDB = item.productId?.reviews?.some((r: any) => r.user === user?._id);
                      const isReviewed = isReviewedFromDB || reviewedItems.includes(productId);
                      const isFormOpen = activeReviewProductId === productId;

                      return (
                        <div key={index} className="flex flex-col border-b last:border-0 pb-4 last:pb-0 border-slate-100">
                          {/* DÒNG THÔNG TIN SẢN PHẨM */}
                          <div className="flex gap-4">
                            <div className="w-16 h-16 bg-white rounded-md border overflow-hidden flex-shrink-0 flex items-center justify-center">
                              {productImg ? (
                                <img src={productImg} alt={productName} className="w-full h-full object-cover" />
                              ) : (
                                <Package className="w-8 h-8 text-slate-300" />
                              )}
                            </div>
                            
                            <div className="flex-1 flex flex-col justify-between">
                              <h4 className="font-medium text-sm line-clamp-2">{productName}</h4>
                              <div className="flex justify-between items-center text-sm mt-2">
                                <span className="text-muted-foreground">x{item.quantity}</span>
                                <span className="font-semibold text-red-600">{(item.price).toLocaleString('vi-VN')}đ</span>
                              </div>
                            </div>

                            <div className="flex items-center ml-4">
                              {order.status === 'Đã giao thành công' && productId && !isReviewed && (
                                <Button 
                                  size="sm" 
                                  variant={isFormOpen ? "default" : "outline"}
                                  className={isFormOpen ? "" : "border-primary text-primary hover:bg-primary hover:text-white"}
                                  onClick={() => toggleReviewForm(productId)}
                                >
                                  {isFormOpen ? "Đóng lại" : "Đánh giá"}
                                </Button>
                              )}
                              {order.status === 'Đã giao thành công' && isReviewed && (
                                <span className="text-xs text-green-600 flex items-center font-medium">
                                  <CheckCircle2 className="w-3 h-3 mr-1" /> Đã đánh giá
                                </span>
                              )}
                            </div>
                          </div>

                          {/* FORM ĐÁNH GIÁ (CHỈ HIỆN KHI ĐƯỢC BẤM) */}
                          {isFormOpen && (
                            <div className="mt-4 ml-0 sm:ml-[80px] p-5 bg-slate-50 border border-slate-200 rounded-xl animate-in slide-in-from-top-2 fade-in duration-200 relative shadow-sm">
                              
                              {/* Mũi tên nhỏ trỏ lên trên (chỉ hiện trên màn hình to) */}
                              <div className="hidden sm:block absolute -top-2 left-8 w-4 h-4 bg-slate-50 border-t border-l border-slate-200 transform rotate-45"></div>

                              <h4 className="font-semibold flex items-center text-slate-900 mb-4 text-sm">
                                <MessageSquare className="w-4 h-4 mr-2 text-primary" /> 
                                Viết đánh giá cho sản phẩm
                              </h4>
                              
                              <form onSubmit={(e) => handleSubmitReview(e, productId)} className="space-y-4">
                                
                                {/* KHU VỰC CHỌN SAO (ĐÃ FIX LỖI CLICK) */}
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-slate-700 mr-2">Chất lượng:</span>
                                  <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <button
                                        key={star}
                                        type="button" // Bắt buộc phải là button type="button" để không submit form
                                        onClick={() => setRating(star)}
                                        className="p-1 focus:outline-none transition-transform hover:scale-110"
                                      >
                                        <Star 
                                          className={`w-7 h-7 ${rating >= star ? "text-yellow-400" : "text-slate-300"}`} 
                                          fill={rating >= star ? "currentColor" : "none"} // <--- ĐIỂM ĂN TIỀN Ở ĐÂY
                                        />
                                      </button>
                                    ))}
                                  </div>
                                  <span className="ml-2 text-xs font-medium text-muted-foreground w-20">
                                    {rating === 5 ? "Tuyệt vời" : rating === 4 ? "Rất tốt" : rating === 3 ? "Bình thường" : rating === 2 ? "Kém" : "Tệ"}
                                  </span>
                                </div>

                                <Textarea 
                                  rows={3} 
                                  required
                                  placeholder="Sản phẩm dùng tốt không? Chia sẻ cảm nhận của bạn nhé..."
                                  value={comment}
                                  onChange={(e) => setComment(e.target.value)}
                                  className="resize-none bg-white text-sm focus:border-primary transition-colors"
                                />

                                <div className="flex justify-end gap-2 pt-2">
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setActiveReviewProductId(null)}
                                  >
                                    Hủy
                                  </Button>
                                  <Button type="submit" size="sm" disabled={submitting}>
                                    {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                                  </Button>
                                </div>
                              </form>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-slate-50/50 p-4 border-t flex justify-end items-center gap-4">
                    <span className="text-sm text-muted-foreground">Thành tiền:</span>
                    <span className="text-xl font-bold text-red-600">{order.totalPrice.toLocaleString('vi-VN')}đ</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}