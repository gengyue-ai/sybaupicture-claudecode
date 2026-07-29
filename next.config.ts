import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // SEO优化配置
  compress: true,
  poweredByHeader: false,
  
  // 图片优化
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // 缓存优化
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          }
        ],
      },
      // 静态资源缓存
      {
        source: '/favicon.svg',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/logo-(.*)\\.(svg|png|jpg|jpeg|webp)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  },

  // 重定向配置
  async redirects() {
    return [
      // 确保主要页面的SEO友好重定向
      {
        source: '/faq',
        destination: '/help',
        permanent: true,
      },
    ]
  },

  // 实验性功能 - 性能优化
  // optimizeCss: 关闭以避免 critters 导致的 RSC 错误
  experimental: {
    gzipSize: true,
  },

  // 构建优化
  typescript: {
    // 生产环境忽略类型错误，避免构建失败
    ignoreBuildErrors: false,
  },
  
  eslint: {
    // 生产环境忽略ESLint错误，避免构建失败
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
