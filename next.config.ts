import type { NextConfig } from "next";

const githubPages = process.env.GITHUB_PAGES === "true";
const basePath = githubPages ? "/Besslov-site" : "";

const nextConfig: NextConfig = {
  output: githubPages ? "export" : undefined,
  basePath: githubPages ? basePath : undefined,
  trailingSlash: githubPages,
  images: githubPages ? { unoptimized: true } : undefined,
};

export default nextConfig;
