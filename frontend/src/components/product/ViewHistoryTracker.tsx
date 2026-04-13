"use client";

import { useEffect } from "react";

const HISTORY_KEY = "techzone-view-history";
const MAX_HISTORY = 20;

export default function ViewHistoryTracker({ productId }: { productId: string }) {
  useEffect(() => {
    if (!productId) return;

    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      const history: string[] = Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];

      const nextHistory = [productId, ...history.filter((id) => id !== productId)].slice(0, MAX_HISTORY);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
    } catch (error) {
      console.error("Lỗi lưu lịch sử xem sản phẩm:", error);
    }
  }, [productId]);

  return null;
}
