const { GoogleGenerativeAI } = require('@google/generative-ai');
const Product = require('../models/Product');

// Khởi tạo biến genAI ở ngoài để tối ưu hiệu suất (giống code mẫu của bạn)
let genAI = null;
function getGeminiClient() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('Chưa cấu hình GEMINI_API_KEY');
    genAI = new GoogleGenerativeAI(apiKey);
    
  }
  
  return genAI;
}



const handleChat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "Bạn chưa nhập câu hỏi." });
    }

    // 1. Kéo dữ liệu từ Database
    const products = await Product.find({ stock: { $gt: 0 } }).select('name price category');
    const productListText = products.map(p => `- ${p.name}: ${p.price.toLocaleString('vi-VN')}đ`).join('\n');

    // 2. Lấy client
    const client = await getGeminiClient();

    // 3. Khởi tạo Model với systemInstruction (Chuẩn y hệt đoạn code xịn bạn vừa tìm được)
    const systemPrompt = `Bạn là trợ lý AI ảo của cửa hàng phụ kiện điện thoại TechZone. 
QUY TẮC BẮT BUỘC:
1. KHÔNG SỬ DỤNG ký tự Markdown (tuyệt đối không dùng dấu * hay **). Hãy dùng emoji (👉, 📱, 🔋, 🎧, 💰) để làm nổi bật.
2. TƯ VẤN NGẮN GỌN: Khi khách hỏi, CHỈ chọn ra TỐI ĐA 3 SẢN PHẨM phù hợp nhất để giới thiệu. KHÔNG liệt kê cả danh sách.
3. CẤU TRÚC ĐỀ XUẤT:
   👉 Tên sản phẩm
   💰 Giá: [Giá tiền]
   (xuống dòng)
4. Thái độ thân thiện, xưng "mình" và gọi khách là "bạn".

DANH SÁCH SẢN PHẨM HIỆN CÓ TRONG KHO:
${productListText}`;

    // // Cấu hình AI chuẩn mới
    // const model = client.getGenerativeModel({
    //   model: 'gemini-2.5-flash-lite', // Model nhanh, ổn định và miễn phí
      
    //   systemInstruction: systemPrompt,
    // });

    // 4. Gửi câu hỏi của khách
    const result = await model.generateContent(message);
    const text = result.response.text();

    res.json({ reply: text });

  } catch (error) {
    console.error("--- LỖI CHATBOT ---");
    
    console.error(error.message);
    
    
    res.status(500).json({ reply: "Hệ thống AI đang quá tải, bạn vui lòng thử lại sau vài giây nhé!" });
  }
};

module.exports = { handleChat };