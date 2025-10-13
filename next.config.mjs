// next.config.mjs
import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // React configuration
  reactStrictMode: true,

  // Build configuration
  output: "standalone",
  swcMinify: true,

  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // SCSS configuration
  sassOptions: {
    includePaths: [
      path.join(process.cwd(), "src/styles"),
      path.join(process.cwd(), "styles"),
    ],
  },

  // Environment variables
  env: {
    MONGODB_URL: process.env.MONGODB_URL,
  },

  // Image optimization
  images: {
    domains: ["res.cloudinary.com", "images.unsplash.com"],
    formats: ["image/webp", "image/avif"],
  },

  // Custom webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add custom webpack configurations here

    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization.splitChunks.chunks = "all";
    }

    return config;
  },

  // Headers for security
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      // Add custom redirects here
    ];
  },

  // Rewrites for API routes
  async rewrites() {
    return [
      // Add custom rewrites here
    ];
  },
};

export default nextConfig;
