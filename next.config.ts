import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",          // static HTML for Cloudflare Pages / GitHub Pages
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
