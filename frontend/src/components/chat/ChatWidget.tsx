"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, Sparkles } from "lucide-react";

export default function ChatWidget() {
  const [messages, setMessages] = useState<{role: "user"|"ai", text: string}[]>([
    { role: "ai", text: "Xin chào! Mình là trợ lý AI của TechZone.\nMình có thể giúp bạn tra cứu giá cả, thông tin phụ kiện hoặc kiểm tra tình trạng còn hàng. Bạn cần tìm gì hôm nay?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 150);
    return () => clearTimeout(timeout);
  }, [messages]);

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
    } catch (error) {
      setMessages(prev => [...prev, { role: "ai", text: "Lỗi kết nối! Xin thử lại sau." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
  <div 
    className="w-full max-w-2xl mx-auto rounded-2xl overflow-hidden border border-slate-200 shadow-[0_10px_40px_rgba(0,0,0,0.08)] bg-white"
    style={{ 
      display: 'grid', 
      gridTemplateRows: '76px 1fr 84px', 
      height: '600px', 
      maxHeight: '80vh' ,
      
    }}
  >

    {/* HEADER */}
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-5 flex items-center gap-4 shadow-md"
    style={{ padding:10 }}>
  
  <div className="w-10 h-10 flex items-center justify-center rounded-xl 
                  bg-white/20 backdrop-blur-md">
    <Bot className="w-5 h-5 text-black" 
    />
  </div>

  <div>
    <h3 className="text-black font-semibold text-[16px]">TechZone AI</h3>
    <div className="flex items-center gap-2 text-emerald-400 text-[12px] mt-1">
      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
      Online
    </div>
  </div>

</div>

    {/* BODY */}
    <div className="overflow-y-auto px-5 py-6 space-y-5 bg-gradient-to-b from-slate-50 to-white scroll-smooth"
    style={{ padding: 20 }}>
      {messages.map((msg, idx) => (
        <div 
          key={idx} 
          className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
            msg.role === "user" ? "justify-end" : "justify-start"
          }`}
        >

          {msg.role === "ai" && (
            <div className="w-9 h-9 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-slate-600"
              style={{ 
                height:25,
                width:25
               }}/>
            </div>
          )}

          <div
            className={`px-4 py-3 rounded-2xl max-w-[80%] text-[14.5px] leading-relaxed shadow-sm transition-all
            ${msg.role === "user"
              ? "bg-slate-900 text-white rounded-tr-sm"
              : "bg-white border border-slate-200 text-slate-700 rounded-tl-sm"
            }`}
          >
            {msg.text}
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex gap-3 items-center">
          <div className="w-9 h-9 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm">
            <Bot className="w-4 h-4 animate-bounce text-slate-600" />
          </div>
          <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl flex gap-1">
            <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></span>
            <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:150ms]"></span>
            <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:300ms]"></span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>

    {/* FOOTER */}
    <form 
      onSubmit={sendMessage}
      className="bg-white border-t border-slate-200 px-4 flex items-center gap-3"
    >
      <input
        type="text"
        placeholder="Nhắn gì đó cho TechZone..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="flex-1 h-[50px] rounded-full px-5 text-[14px] bg-slate-100 
                   focus:bg-white focus:ring-2 focus:ring-slate-900/10 
                   outline-none transition-all border border-transparent focus:border-slate-300"
      />

      <button
        type="submit"
        disabled={isLoading || !input.trim()}
        className="h-[50px] w-[50px] rounded-full bg-slate-900 text-white 
                   flex items-center justify-center 
                   hover:bg-slate-800 active:scale-95 
                   disabled:bg-slate-300 transition-all shadow-md"
        style={{ 
                height:25,
                width:25
               }}
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  </div>
);
}