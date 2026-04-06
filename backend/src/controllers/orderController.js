const Order = require('../models/Order');
const Product = require('../models/Product'); 
const crypto = require('crypto');
const querystring = require('querystring');

const createOrder = async (req, res) => {
  try {
    const { items, shippingInfo, totalPrice, paymentMethod } = req.body;

    if (items && items.length === 0) {
      return res.status(400).json({ message: 'Không có sản phẩm nào trong đơn hàng' });
    }

   
    // BƯỚC 1: CHỈ KIỂM TRA (VALIDATE) TẤT CẢ SẢN PHẨM
   
    const productsToUpdate = []; // Mảng tạm để lưu các sản phẩm đã pass kiểm tra
    
    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({ message: `Sản phẩm không tồn tại!` });
      }
      
      if (product.stock < item.quantity) {
        // Ném lỗi ngay lập tức, và KHÔNG có dữ liệu nào bị lưu hay thay đổi cả
        return res.status(400).json({ 
          message: `Rất tiếc! Sản phẩm "${product.name}" chỉ còn ${product.stock} chiếc, không đủ số lượng bạn cần.` 
        });
      }
      
      // Nếu đủ hàng, cất tạm vào mảng chuẩn bị trừ kho
      productsToUpdate.push({ product, quantity: item.quantity });
    }

  
    // BƯỚC 2: TRỪ KHO ĐỒNG LOẠT
    // (Chỉ chạy đến đây khi vòng lặp trên đã pass 100%)
   
    for (const item of productsToUpdate) {
      item.product.stock -= item.quantity;
      await item.product.save(); // Lúc này mới thực sự lưu sự thay đổi vào Database
    }

    
    // BƯỚC 3: TẠO VÀ LƯU ĐƠN HÀNG
    
    const order = new Order({
      userId: req.user._id,
      items,
      shippingInfo,
      totalPrice,
      paymentMethod,
      status: paymentMethod === 'VNPAY' ? 'Chờ thanh toán' : 'Chờ xác nhận'
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LẤY DANH SÁCH ĐƠN HÀNG CỦA USER ĐANG ĐĂNG NHẬP
const getMyOrders = async (req, res) => {
  try {
    // Chỉ tìm những đơn hàng có userId khớp với ID của người đang request
    const orders = await Order.find({ userId: req.user._id })
      .populate('items.productId', 'name images reviews')
      .sort({ createdAt: -1 }); // Mới nhất xếp lên đầu
      
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




// --- HÀM HỖ TRỢ: SẮP XẾP OBJECT THEO CHUẨN VNPAY ---
function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

// --- API 1: TẠO LINK THANH TOÁN VNPAY (ĐÃ FIX LỖI DATA FORMAT 100%) ---
const createPaymentUrl = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

    if (!process.env.VNP_TMNCODE || !process.env.VNP_HASHSECRET || !process.env.VNP_URL) {
      console.log("❌ LỖI SERVER: Chưa load được cấu hình .env của VNPAY!");
      return res.status(500).json({ message: 'Lỗi cấu hình máy chủ, vui lòng báo cho Admin' });
    }

    let date = new Date();
    let createDate = date.getFullYear().toString() + 
                     (date.getMonth() + 1).toString().padStart(2, '0') + 
                     date.getDate().toString().padStart(2, '0') + 
                     date.getHours().toString().padStart(2, '0') + 
                     date.getMinutes().toString().padStart(2, '0') + 
                     date.getSeconds().toString().padStart(2, '0');

    // Lấy IP Sạch và chuẩn hóa IPv4
    let ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    if (typeof ipAddr === 'string' && ipAddr.includes(',')) {
        ipAddr = ipAddr.split(',')[0].trim();
    }
    if (ipAddr === '::1') {
        ipAddr = '127.0.0.1';
    }

    let tmnCode = process.env.VNP_TMNCODE;
    let vnpUrl = process.env.VNP_URL;
    let returnUrl = process.env.VNP_RETURNURL;

    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = order._id.toString(); 
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan don hang'; 
    vnp_Params['vnp_OrderType'] = 'other';
    // Ép kiểu chuỗi để VNPAY không báo lỗi số học
    vnp_Params['vnp_Amount'] = Math.floor(order.totalPrice * 100).toString(); 
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;

    // Sắp xếp các tham số theo thứ tự alphabet
    vnp_Params = sortObject(vnp_Params);
    
    // TỰ TAY NỐI CHUỖI ĐỂ TRÁNH LỖI QUERYSTRING BỊ OBJECT
    let signData = "";
    for (let key in vnp_Params) {
        if (vnp_Params.hasOwnProperty(key)) {
            signData += key + '=' + vnp_Params[key] + '&';
        }
    }
    // Xóa dấu '&' thừa ở cuối cùng
    if (signData.length > 0) {
        signData = signData.slice(0, -1);
    }

    // Tạo mã băm
    let secretKey = process.env.VNP_HASHSECRET;
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex"); 
    
    // Nối link hoàn chỉnh để gửi cho người dùng
    let finalUrl = vnpUrl + '?' + signData + '&vnp_SecureHash=' + signed;

    res.json({ paymentUrl: finalUrl });
  } catch (error) {
    console.error("Lỗi tạo link VNPAY:", error);
    res.status(500).json({ message: error.message });
  }
};

// --- API 2: XỬ LÝ KẾT QUẢ VNPAY TRẢ VỀ ---
const vnpayReturn = async (req, res) => {
  try {
    let vnp_Params = req.body;
    let secureHash = vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);
    let secretKey = process.env.VNP_HASHSECRET;

    let signData = "";
    for (let key in vnp_Params) {
        if (vnp_Params.hasOwnProperty(key)) {
            signData += key + '=' + vnp_Params[key] + '&';
        }
    }
    if (signData.length > 0) {
        signData = signData.slice(0, -1);
    }

    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    if (secureHash === signed) {
      const orderId = vnp_Params['vnp_TxnRef'];
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
      }

      if (vnp_Params['vnp_ResponseCode'] === '00') {
        // THANH TOÁN THÀNH CÔNG
        order.isPaid = true;
        order.paidAt = Date.now();
        order.status = 'Chờ xác nhận'; 
        await order.save();
        return res.status(200).json({ message: 'Giao dịch thành công' });
      } else {
        // THANH TOÁN THẤT BẠI HOẶC BỊ HỦY
        // SỬA Ở ĐÂY: Cập nhật trạng thái để Admin biết đơn này đã hỏng
        order.status = 'Đã hủy'; 
        await order.save();
        return res.status(400).json({ message: 'Giao dịch bị hủy hoặc thất bại' });
      }
    } else {
      return res.status(400).json({ message: 'Chữ ký không hợp lệ' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = { createOrder , getMyOrders, createPaymentUrl, vnpayReturn };