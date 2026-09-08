import type { NextConfig } from "next";

// Set NEXT_PUBLIC_BASE_PATH to "/vishnuvardhan.io" when serving from
// vishnu-vardhan-d.github.io/vishnuvardhan.io/. Leave it empty for a root domain.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
};

export default nextConfig;
