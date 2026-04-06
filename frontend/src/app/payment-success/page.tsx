"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/store/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, ShoppingBag } from "lucide-react";
import Link from "next/link";

// Tách logic ra một component con để bọc trong Suspense (Bắt buộc trong Next.js 14+ khi dùng useSearchParams)
function PaymentStatusHandler() {
  const searchParams = useSearchParams();
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Đang xác thực giao dịch...");

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const verifyPayment = async () => {
      // 1. Gom tất cả tham số trên URL mà VNPAY gửi về
      const paramsObj: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        paramsObj[key] = value;
      });

      // Nếu không có tham số nào của VNPAY, có thể user vào nhầm
      if (Object.keys(paramsObj).length === 0) {
        setStatus("error");
        setMessage("Không tìm thấy thông tin giao dịch hợp lệ.");
        return;
      }

      // 2. Gửi cục params này về Backend để Backend so sánh chữ ký (Hash)
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/vnpay-return`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(paramsObj)
        });

        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage("Giao dịch thanh toán VNPAY thành công!");
        } else {
          setStatus("error");
          setMessage(data.message || "Giao dịch thất bại hoặc đã bị hủy.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Lỗi kết nối đến máy chủ khi xác thực giao dịch.");
      }
    };

    verifyPayment();
  }, [searchParams, token, isAuthenticated]);

  return (
    <Card className="border-none shadow-xl w-full max-w-md mx-auto text-center overflow-hidden">
      <CardContent className="pt-10 pb-8 px-6">
        
        {status === "loading" && (
          <div className="flex flex-col items-center animate-pulse">
            <Loader2 className="w-20 h-20 text-blue-500 animate-spin mb-6" />
            <h2 className="text-2xl font-bold text-slate-800">Đang xử lý...</h2>
            <p className="text-slate-500 mt-2">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center animate-in zoom-in duration-500">
            <CheckCircle2 className="w-24 h-24 text-green-500 mb-6 drop-shadow-md" />
            <h2 className="text-2xl font-bold text-slate-800">Thanh toán thành công!</h2>
            <p className="text-slate-500 mt-2 mb-8">{message}</p>
            <div className="flex gap-4 w-full">
              <Link href="/my-orders" className="flex-1">
                <Button className="w-full" variant="outline">Xem đơn hàng</Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button className="w-full bg-green-600 hover:bg-green-700">Mua tiếp</Button>
              </Link>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center animate-in zoom-in duration-300">
            <XCircle className="w-24 h-24 text-red-500 mb-6 drop-shadow-md" />
            <h2 className="text-2xl font-bold text-slate-800">Thanh toán thất bại</h2>
            <p className="text-slate-500 mt-2 mb-8">{message}</p>
            <div className="flex gap-4 w-full">
              <Link href="/my-orders" className="flex-1">
                <Button className="w-full" variant="outline">Xem đơn hàng</Button>
              </Link>
              <Link href="/cart" className="flex-1">
                <Button className="w-full bg-red-600 hover:bg-red-700">Thử lại</Button>
              </Link>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}

// Component chính
export default function PaymentSuccessPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 p-4">
      <Suspense fallback={
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      }>
        <PaymentStatusHandler />
      </Suspense>
    </div>
  );
}