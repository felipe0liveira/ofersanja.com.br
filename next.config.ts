import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "**.mlstatic.com" },
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "http", hostname: "http2.mlstatic.com" },
    ],
  },

  async rewrites() {
    return [
      // API calls on the admin subdomain must NOT be prefixed — pass through unchanged
      {
        source: "/api/:path*",
        has: [{ type: "host", value: "admin.ofersanja.com.br" }],
        destination: "/api/:path*",
      },
      // All other paths on the admin subdomain are rewritten to /admin/*
      {
        source: "/:path*",
        has: [{ type: "host", value: "admin.ofersanja.com.br" }],
        destination: "/admin/:path*",
      },
    ];
  },
};

export default nextConfig;
