import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.0.244'],
  devIndicators: false,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  
  // ─── Performance Optimizations ───
  compress: true,                      // Enable gzip/brotli compression
  poweredByHeader: false,              // Remove X-Powered-By header (security + smaller response)
  
  // Tree-shake heavy packages — only bundle icons/functions actually used
  optimizePackageImports: [
    'lucide-react',                    // ~200KB savings: only imports used icons
    'framer-motion',                   // ~120KB savings: only imports used APIs
    'date-fns',                        // Only imports used date functions
  ],

  experimental: {
    optimizeCss: true,                 // Minimize CSS output
  },
};

export default nextConfig;
