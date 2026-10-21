import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Dev-server asset requests are only served to origins listed here. Without
  // this, opening the site as 127.0.0.1:3000 or from the LAN IP instead of
  // localhost logs a cross-origin warning and, in newer Next versions, fails
  // the /_next/* chunk requests outright — which reads as "the site is broken".
  allowedDevOrigins: ["localhost", "127.0.0.1", "192.168.0.109"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
