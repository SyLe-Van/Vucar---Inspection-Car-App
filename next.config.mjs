// next.config.mjs
import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  sassOptions: {
    includePaths: [path.join(process.cwd(), "styles")],
  },
  env: {
    MONGODB_URL: process.env.MONGODB_URL,
  },
  images: {
    domains: ["res.cloudinary.com"],
  },
};

export default nextConfig;
