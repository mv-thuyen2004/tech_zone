"use client";

import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PaginationControl({ page, pages }: { page: number; pages: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Nếu chỉ có 1 trang hoặc không có dữ liệu thì ẩn thanh phân trang đi
  if (pages <= 1) return null;

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    
    // Đẩy số trang mới lên URL
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex justify-center items-center gap-4 mt-12 mb-8">
      <Button
        variant="outline"
        className="rounded-full px-6"
        disabled={page <= 1}
        onClick={() => handlePageChange(page - 1)}
      >
        <ChevronLeft className="h-4 w-4 mr-2" /> Trước
      </Button>
      
      <span className="text-sm font-medium text-muted-foreground bg-muted px-4 py-2 rounded-full">
        Trang <strong className="text-foreground">{page}</strong> / {pages}
      </span>
      
      <Button
        variant="outline"
        className="rounded-full px-6"
        disabled={page >= pages}
        onClick={() => handlePageChange(page + 1)}
      >
        Sau <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}