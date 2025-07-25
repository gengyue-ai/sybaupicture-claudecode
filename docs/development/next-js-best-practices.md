# Next.js 开发最佳实践

> 基于Sybau Picture项目经验总结的Next.js开发最佳实践，涵盖性能、SEO、安全性等多个方面。

## 🚀 项目结构与架构

### App Router最佳实践

```
app/
├── (auth)/                 # 路由组，不影响URL
│   ├── login/
│   └── register/
├── [locale]/              # 动态路由，多语言支持
│   ├── page.tsx
│   └── layout.tsx
├── api/                   # API路由
│   ├── auth/
│   └── generate/
├── globals.css
├── layout.tsx             # 根布局
└── page.tsx              # 首页
```

### 组件组织原则

```typescript
// ✅ 推荐：服务端组件 + 客户端组件分离
// app/help/page.tsx - 服务端组件（SEO友好）
import { Metadata } from 'next'
import HelpPageClient from './HelpPageClient'

export const metadata: Metadata = {
  title: 'Help & Support',
  description: '...',
}

export default function HelpPage() {
  return <HelpPageClient />
}

// app/help/HelpPageClient.tsx - 客户端组件（交互）
'use client'
export default function HelpPageClient() {
  // 所有状态和交互逻辑
}
```

## 📱 性能优化

### 图片优化

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fal.media',
        port: '',
        pathname: '/**',
      },
    ],
  },
}
```

### 代码分割与懒加载

```typescript
// ✅ 动态导入重型组件
import dynamic from 'next/dynamic'

const ImageGenerator = dynamic(() => import('@/components/ImageGenerator'), {
  loading: () => <div>Loading...</div>,
  ssr: false, // 如果组件不需要SSR
})

// ✅ 路由级代码分割
const AdminPanel = dynamic(() => import('@/components/AdminPanel'), {
  loading: () => <AdminPanelSkeleton />
})
```

### 缓存策略

```typescript
// next.config.ts - HTTP缓存配置
async headers() {
  return [
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
      source: '/api/static-data',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, s-maxage=3600, stale-while-revalidate=86400'
        }
      ]
    }
  ]
}
```

## 🔐 安全性最佳实践

### 环境变量管理

```typescript
// lib/config.ts - 智能环境配置
export const config = {
  // 公开变量（客户端可见）
  publicStripeKey: process.env.NODE_ENV === 'production' 
    ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_PROD
    : process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_DEV,
    
  // 私密变量（仅服务端）
  stripeSecretKey: process.env.NODE_ENV === 'production'
    ? process.env.STRIPE_SECRET_KEY_PROD
    : process.env.STRIPE_SECRET_KEY_DEV,
}

// ✅ 环境变量验证
const requiredEnvVars = ['DATABASE_URL', 'NEXTAUTH_SECRET']
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
})
```

### API路由安全

```typescript
// app/api/secure-endpoint/route.ts
import { NextRequest } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'
import { verifyAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  // ✅ 速率限制
  const { success } = await rateLimit(request.ip)
  if (!success) {
    return new Response('Too Many Requests', { status: 429 })
  }
  
  // ✅ 身份验证
  const user = await verifyAuth(request)
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  // ✅ 输入验证
  const body = await request.json()
  const validatedData = schema.parse(body) // 使用zod等验证库
  
  // 处理请求...
}
```

### 内容安全策略 (CSP)

```typescript
// next.config.ts
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https: blob:;
  connect-src 'self' https://accounts.google.com https://api.fal.ai;
  frame-src 'self' https://accounts.google.com;
  font-src 'self' https://fonts.gstatic.com;
`;

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim()
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  }
]
```

## 🌐 SEO优化

### 元数据管理

```typescript
// app/layout.tsx - 全局元数据
import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://sybaupicture.com'),
  title: {
    default: 'Sybau Picture - AI Image Generator',
    template: '%s | Sybau Picture'
  },
  description: 'Create amazing AI-generated images with Sybau Picture',
  verification: {
    google: 'your-google-verification-code',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

// 页面级元数据
export async function generateMetadata({ params }): Promise<Metadata> {
  return {
    title: 'Dynamic Page Title',
    description: 'Dynamic description based on params',
    openGraph: {
      title: 'OG Title',
      description: 'OG Description',
      images: ['/og-image.jpg'],
    },
  }
}
```

### 结构化数据

```typescript
// 组件中添加JSON-LD
export default function ProductPage({ product }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "USD"
    }
  }
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      {/* 页面内容 */}
    </>
  )
}
```

## 🎨 样式与UI

### CSS最佳实践

```typescript
// ✅ 使用CSS Modules或Tailwind CSS
import styles from './Component.module.css'
// 或
import { cn } from '@/lib/utils' // Tailwind + clsx

// ✅ 响应式设计
<div className={cn(
  "w-full p-4",
  "md:w-1/2 md:p-6",
  "lg:w-1/3 lg:p-8"
)}>
```

### 主题和暗色模式

```typescript
// lib/theme-provider.tsx
'use client'
import { createContext, useContext } from 'react'

const ThemeContext = createContext({})

export function ThemeProvider({ children }) {
  return (
    <ThemeContext.Provider value={{}}>
      <div className="theme-light dark:theme-dark">
        {children}
      </div>
    </ThemeContext.Provider>
  )
}
```

## 🔄 状态管理

### 服务端状态 vs 客户端状态

```typescript
// ✅ 服务端状态 - 使用React Query/SWR
import useSWR from 'swr'

function Profile() {
  const { data, error, isLoading } = useSWR('/api/user', fetcher)
  
  if (isLoading) return <ProfileSkeleton />
  if (error) return <ErrorMessage />
  return <ProfileData data={data} />
}

// ✅ 客户端状态 - 使用Zustand/useState
import { create } from 'zustand'

const useUIStore = create((set) => ({
  isModalOpen: false,
  setModalOpen: (open: boolean) => set({ isModalOpen: open }),
}))
```

### Context优化

```typescript
// ✅ 拆分Context避免不必要的重渲染
const UserContext = createContext(null)
const UserActionsContext = createContext(null)

function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  
  const actions = useMemo(() => ({
    updateUser: setUser,
    logout: () => setUser(null)
  }), [])
  
  return (
    <UserContext.Provider value={user}>
      <UserActionsContext.Provider value={actions}>
        {children}
      </UserActionsContext.Provider>
    </UserContext.Provider>
  )
}
```

## 🧪 测试策略

### 单元测试

```typescript
// __tests__/components/Button.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from '@/components/Button'

describe('Button', () => {
  it('calls onClick when clicked', async () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    await userEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### API测试

```typescript
// __tests__/api/auth.test.ts
import { POST } from '@/app/api/auth/route'
import { NextRequest } from 'next/server'

describe('/api/auth', () => {
  it('returns 401 for invalid credentials', async () => {
    const request = new NextRequest('http://localhost/api/auth', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@test.com', password: 'wrong' })
    })
    
    const response = await POST(request)
    expect(response.status).toBe(401)
  })
})
```

## 📊 监控与分析

### 性能监控

```typescript
// lib/performance.ts
export function reportWebVitals(metric) {
  // 发送到分析服务
  if (metric.label === 'web-vital') {
    console.log(metric)
    // 发送到Google Analytics, Sentry等
  }
}

// app/layout.tsx
import { reportWebVitals } from '@/lib/performance'

export { reportWebVitals }
```

### 错误边界

```typescript
// components/ErrorBoundary.tsx
'use client'
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary'

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  )
}

export function ErrorBoundary({ children }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        // 记录错误到监控服务
        console.error('Error caught by boundary:', error, errorInfo)
      }}
    >
      {children}
    </ReactErrorBoundary>
  )
}
```

## 🌍 国际化

### 多语言支持

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['en', 'zh']

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (!pathnameHasLocale) {
    const locale = getLocale(request)
    return NextResponse.redirect(
      new URL(`/${locale}${pathname}`, request.url)
    )
  }
}

// lib/i18n.ts
export const dictionaries = {
  en: () => import('@/dictionaries/en.json').then(m => m.default),
  zh: () => import('@/dictionaries/zh.json').then(m => m.default),
}

export const getDictionary = async (locale: string) => {
  return dictionaries[locale]?.() ?? dictionaries.en()
}
```

## 🚀 部署优化

### 生产构建优化

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  // 生产优化
  compress: true,
  poweredByHeader: false,
  
  // 实验性功能
  experimental: {
    optimizeCss: true,
    gzipSize: true,
  },
  
  // Webpack优化
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    return config
  },
}
```

### 环境特定配置

```typescript
// lib/config.ts
export const isDevelopment = process.env.NODE_ENV === 'development'
export const isProduction = process.env.NODE_ENV === 'production'

export const config = {
  // 根据环境动态配置
  apiUrl: isProduction 
    ? 'https://api.sybaupicture.com' 
    : 'http://localhost:3000/api',
    
  // 功能开关
  features: {
    analytics: isProduction,
    debugMode: isDevelopment,
    experimentalFeatures: process.env.ENABLE_EXPERIMENTAL === 'true',
  },
}
```

## 📋 开发流程

### 代码质量工具

```json
// package.json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:e2e": "playwright test"
  },
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run type-check && npm run test"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

### Git工作流

```bash
# 功能开发流程
git checkout -b feature/new-feature
# 开发和提交
git commit -m "feat: add new feature"
# 合并前检查
npm run type-check && npm run test && npm run build
git push origin feature/new-feature
```

---

**实践总结**: 这些最佳实践基于Sybau Picture项目的实际应用，已在生产环境验证有效。

**文档版本**: v1.0  
**最后更新**: 2025-07-25  
**适用版本**: Next.js 14+  
**维护者**: 前端开发团队