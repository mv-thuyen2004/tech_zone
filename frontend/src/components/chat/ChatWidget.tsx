"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Send,Bot, MessageCircle, X,SendHorizontal } from "lucide-react"; // Import thêm MessageCircle và X

export default function ChatWidget() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: "user"|"ai", text: string}[]>([
    { role: "ai", text: "Xin chào! Mình là trợ lý AI của TechZone.\nMình có thể giúp bạn tra cứu giá cả, thông tin phụ kiện hoặc kiểm tra tình trạng còn hàng. Bạn cần tìm gì hôm nay?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (!isOpen) return;
    requestAnimationFrame(() => {
      if (chatBodyRef.current) {
        chatBodyRef.current.scrollTo({
          top: chatBodyRef.current.scrollHeight,
          behavior,
        });
      }
      messagesEndRef.current?.scrollIntoView({ behavior });
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    const timeout = setTimeout(() => scrollToBottom("auto"), 50);
    return () => clearTimeout(timeout);
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom("smooth");
  }, [messages, isLoading]);

  useEffect(() => {
    setMounted(true);
    const toggleFromHeader = () => {
      setIsOpen((prev) => !prev);
    };

    window.addEventListener("techzone:toggle-chat", toggleFromHeader);

    return () => {
      window.removeEventListener("techzone:toggle-chat", toggleFromHeader);
    };
  }, []);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setMessages(prev => [...prev, { role: "user", text: userText }]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "ai", text: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "ai", text: "Lỗi kết nối! Xin thử lại sau." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9998] pointer-events-none">
      {/* NÚT BONG BÓNG CHAT THẢ NỔI */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="pointer-events-auto fixed bottom-6 right-6 z-[10001] flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg hover:bg-slate-800 hover:scale-105 transition-all duration-300"
        style={{ position: "fixed", bottom: "1.5rem", width: "3.5rem", right: "1.5rem", zIndex: 10001 }}
        aria-label={isOpen ? "Ẩn chatbot" : "Mở chatbot"}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* CỬA SỔ CHAT */}
      <div 
        className="pointer-events-auto fixed bottom-24 right-6 z-[10000] w-[350px] max-w-[calc(100vw-3rem)] rounded-2xl overflow-hidden border border-slate-200 shadow-[0_10px_40px_rgba(0,0,0,0.15)] bg-white origin-bottom-right"
        aria-hidden={!isOpen}
        style={{ 
          position: "fixed",
          bottom: "6rem",
          right: "1.5rem",
          zIndex: 10000,
          boxSizing: "border-box",
          width: "350px",
          minWidth: "350px",
          maxWidth: "350px",
          display: "flex",
          flexDirection: "column",
          height: "500px",
          maxHeight: "calc(100vh - 8rem)",
          overflow: "hidden",
          transition: "opacity 220ms ease, transform 220ms ease, visibility 220ms ease",
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? "translateY(0) scale(1)" : "translateY(8px) scale(0.96)",
          visibility: isOpen ? "visible" : "hidden",
          pointerEvents: isOpen ? "auto" : "none",
        }}
      >

        {/* HEADER - Phần 1 */}
        <header
          className="bg-gradient-to-r from-slate-900 to-slate-800 px-4 flex items-center justify-between shadow-md"
          style={{ flex: "0 0 72px", minHeight: 72 }}
        >
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
                    <Bot className="w-5 h-5" />
                </div>
                <div>
                    <h3 className=" font-semibold text-[16px] ">TechZone AI</h3>
                    <div className="flex items-center gap-2 text-emerald-400 text-[12px] mt-1">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                        Online
                    </div>
                </div>
            </div>
            {/* Nút đóng thu nhỏ trên Header */}
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-300 hover:text-white p-2"
            >
                <X className="w-5 h-5" />
            </button>
        </header>

        {/* BODY - Phần 2: vùng cuộn hội thoại */}
        <main
          ref={chatBodyRef}
          className="px-4 py-4 space-y-4 bg-gradient-to-b from-slate-50 to-white scroll-smooth"
          style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto", overflowX: "hidden" }}
        >
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >

              {msg.role === "ai" && (
                <div className="w-9 h-9 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm shrink-0 ">
                  <Bot className="w-5 h-5" />
                </div>
              )}
  
              <div
                className={`px-4 py-3 rounded-2xl max-w-[85%] text-[14.5px] leading-relaxed shadow-sm transition-all
                ${msg.role === "user"
                  ? "bg-slate-900 text-white rounded-tr-sm"
                  : "bg-white border border-slate-200 text-slate-700 rounded-tl-sm"
                }`}
                style={{ wordBreak: "break-word", overflowWrap: "anywhere", whiteSpace: "pre-line" }}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 items-center">
              <div className="w-9 h-9 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl flex gap-1">
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:150ms]"></span>
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:300ms]"></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </main>

        {/* FOOTER - Phần 3: ô nhập và gửi */}
        <form 
          onSubmit={sendMessage}
          className="bg-white border-t border-slate-200 px-4 py-3 flex items-center gap-3"
          style={{ flex: "0 0 76px", minHeight: 76 }}
        >
          <input
            type="text"
            placeholder="Nhắn gì đó..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 h-[44px] rounded-full px-4 text-[14px] bg-slate-100 focus:bg-white focus:ring-2 focus:ring-slate-900/10 outline-none transition-all border border-transparent focus:border-slate-300"
          />

          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="h-[44px] w-[44px] shrink-0 rounded-full bg-white text-blue-600 border-2 border-blue-600 flex items-center justify-center hover:bg-blue-50 active:scale-95 disabled:bg-slate-100 disabled:border-slate-300 disabled:text-slate-400 transition-all shadow-md"
          >
            <SendHorizontal className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}