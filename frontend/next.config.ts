import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000', // Port của backend bạn (nếu backend chạy 5000 thì sửa thành 5000)
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;