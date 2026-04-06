import { Star } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface Review {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function ProductReviews({ productId, reviews = [] }: { productId: string, reviews: Review[] }) {
  return (
    <div className="mt-10 pt-10 ">
      <h2 className="text-2xl font-bold mb-8">Đánh giá từ khách hàng</h2>

      <div className="max-w-4xl mx-auto">
        {reviews.length === 0 ? (
          <div className="bg-slate-50 p-8 rounded-2xl text-center border border-dashed">
            <p className="text-muted-foreground">Sản phẩm này chưa có đánh giá nào.</p>
            <p className="text-sm text-slate-400 mt-2">Bạn có thể đánh giá sau khi đã mua và nhận hàng thành công nhé!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6 max-h-[600px] overflow-y-auto pr-2">
            {reviews.map((review) => (
              <div key={review._id} className="bg-slate-50 p-6 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-slate-900">{review.name}</p>
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`w-4 h-4 ${star <= review.rating ? "text-yellow-400" : "text-slate-300"}`} 
                          fill={star <= review.rating ? "currentColor" : "none"} 
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs font-medium text-slate-400 bg-white px-2 py-1 rounded-md border">
                    {format(new Date(review.createdAt), "dd/MM/yyyy", { locale: vi })}
                  </span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed mt-2">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}