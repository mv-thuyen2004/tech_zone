
# TechZone - Hệ thống Thương Mại Điện Tử Phụ Kiện Điện Thoại

TechZone là một ứng dụng web thương mại điện tử full-stack chuyên cung cấp các sản phẩm phụ kiện điện thoại (ốp lưng, cáp sạc, tai nghe, kính cường lực,...). Dự án được xây dựng với kiến trúc hiện đại, tích hợp nhiều tính năng nâng cao như thanh toán trực tuyến qua VNPAY, quản lý trạng thái giỏ hàng đồng bộ và Trợ lý ảo AI tư vấn khách hàng.

## 🚀 Tính năng nổi bật

### Dành cho Khách hàng (User)
- **Tài khoản & Xác thực:** Đăng ký, đăng nhập, quản lý hồ sơ cá nhân và đổi mật khẩu (Sử dụng JWT).
- **Mua sắm:** Xem danh sách sản phẩm, tìm kiếm nâng cao (theo tên, danh mục, tags), lọc theo giá và sắp xếp.
- **Giỏ hàng thông minh:** Thêm, sửa, xóa sản phẩm trong giỏ hàng. Trạng thái giỏ hàng được quản lý bằng Zustand và đồng bộ với Database.
- **Thanh toán:** Hỗ trợ thanh toán khi nhận hàng (COD) và thanh toán trực tuyến qua cổng **VNPAY**.
- **Đơn hàng:** Theo dõi lịch sử đơn hàng và trạng thái vận chuyển.
- **Tương tác:** Đánh giá, xếp hạng (review & rating) sản phẩm sau khi mua thành công. Gợi ý sản phẩm mua kèm (Cross-selling).
- **AI Chatbot:** Trợ lý ảo tích hợp **Google Gemini AI** giúp tư vấn, báo giá và giải đáp thắc mắc khách hàng tự động 24/7.

### Dành cho Quản trị viên (Admin)
- **Dashboard:** Thống kê tổng quan doanh thu, số lượng đơn hàng, khách hàng và biểu đồ phân bổ sản phẩm.
- **Quản lý Sản phẩm:** Thêm mới (kèm upload ảnh lên Cloudinary), chỉnh sửa, xóa và theo dõi số lượng tồn kho.
- **Quản lý Đơn hàng:** Xem danh sách toàn bộ đơn hàng, duyệt đơn và cập nhật trạng thái (Chờ xác nhận, Đang giao, Thành công, Đã hủy). Tự động hoàn lại tồn kho khi hủy đơn.

## 🛠 Công nghệ sử dụng

**Frontend:**
- [Next.js](https://nextjs.org/) (React Framework)
- [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/) (Giao diện)
- [Zustand](https://github.com/pmndrs/zustand) (Quản lý trạng thái)
- [Recharts](https://recharts.org/) (Vẽ biểu đồ thống kê)

**Backend:**
- [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/) & Mongoose (Cơ sở dữ liệu)
- [JWT (JSON Web Token)](https://jwt.io/) & Bcrypt (Bảo mật)
- [Cloudinary](https://cloudinary.com/) (Lưu trữ hình ảnh)
- [Google Generative AI](https://ai.google.dev/) (Tích hợp Gemini cho Chatbot)
- VNPAY (Cổng thanh toán)

## 📂 Cấu trúc thư mục chính

```text
tech_zone/
├── backend/               # Mã nguồn máy chủ (API)
│   ├── seeder/            # Chứa script và data mẫu (CSV, hình ảnh) để nạp DB
│   ├── src/
│   │   ├── config/        # Cấu hình kết nối DB
│   │   ├── controllers/   # Xử lý logic API
│   │   ├── middlewares/   # Auth, Upload,...
│   │   ├── models/        # Mongoose schemas (User, Product, Order, Cart)
│   │   └── routes/        # Định tuyến API
│   └── server.js          # File khởi chạy Backend
├── frontend/              # Mã nguồn giao diện người dùng
│   ├── src/
│   │   ├── app/           # App router Next.js (Pages, Layout)
│   │   ├── components/    # Reusable UI components (Layout, Product, UI)
│   │   ├── lib/           # Tiện ích (Utils)
│   │   └── store/         # Zustand store (Auth, Cart)
│   └── package.json
└── package.json           # File config chung gốc
```

## ⚙️ Hướng dẫn cài đặt và chạy dự án

### Yêu cầu hệ thống
- Node.js (phiên bản 18+ khuyến nghị)
- MongoDB (Local hoặc MongoDB Atlas)
- Tài khoản Cloudinary, VNPAY Sandbox và Google Gemini API Key.

### 1. Cài đặt các gói phụ thuộc (Dependencies)
Cài đặt cho cả Backend và Frontend:
```bash
# Tại thư mục gốc
npm install

# Tại thư mục backend
cd backend
npm install

# Tại thư mục frontend
cd ../frontend
npm install
```

### 2. Thiết lập Biến môi trường (.env)

**Trong thư mục `backend/`, tạo file `.env` với nội dung sau:**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/techzone # Hoặc link MongoDB Atlas của bạn
JWT_SECRET=chuoi_bi_mat_cho_jwt_cua_ban

# Cấu hình Cloudinary (Lưu ảnh)
CLOUDINARY_CLOUD_NAME=ten_cloud_cua_ban
CLOUDINARY_API_KEY=api_key_cua_ban
CLOUDINARY_API_SECRET=api_secret_cua_ban

# Cấu hình VNPAY Sandbox (Thanh toán)
VNP_TMNCODE=tmncode_cua_ban
VNP_HASHSECRET=hashsecret_cua_ban
VNP_URL=[https://sandbox.vnpayment.vn/paymentv2/vpcpay.html](https://sandbox.vnpayment.vn/paymentv2/vpcpay.html)
VNP_RETURNURL=http://localhost:3000/payment-success

# Cấu hình Google Gemini (Cho AI Chatbot)
GEMINI_API_KEY=api_key_gemini_cua_ban
```

**Trong thư mục `frontend/`, tạo file `.env.local` với nội dung sau:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Nạp dữ liệu mẫu (Seeder)
Để có sẵn dữ liệu sản phẩm và tài khoản Admin để test, hãy chạy lệnh sau:
```bash
cd backend
npm run data:import
```
*Lưu ý: Quá trình này sẽ xóa sạch dữ liệu cũ trong DB, tạo tài khoản Admin (Email: `admin@gmail.com` / Pass: `password123`) và upload ảnh từ thư mục `backend/seeder/images` lên Cloudinary.*

### 4. Khởi chạy ứng dụng

**Mở Terminal 1 (Chạy Backend):**
```bash
cd backend
npm run dev
# Server sẽ chạy tại http://localhost:5000
```

**Mở Terminal 2 (Chạy Frontend):**
```bash
cd frontend
npm run dev
# Web sẽ chạy tại http://localhost:3000
```

Truy cập `http://localhost:3000` để trải nghiệm ứng dụng.

## 👤 Tài khoản kiểm thử
Sau khi chạy lệnh import data, bạn có thể sử dụng tài khoản sau để đăng nhập vào trang Admin:
- **Email:** `admin@gmail.com`
- **Mật khẩu:** `password123`

---

```
**Một số lưu ý cho bạn khi dùng file này:**
1. Đảm bảo rằng bạn đã tạo các tài khoản dịch vụ bên thứ ba (Cloudinary, VNPay Sandbox, Google AI Studio) để lấy các API keys điền vào file `.env`.