# Sybau Picture - 完整开发实现指南

## 🚀 快速开始

### 环境要求
```bash
Node.js: >=18.17.0
npm: >=9.0.0
PostgreSQL: >=14.0
```

### 一键初始化
```bash
# 克隆项目后执行
npm install
cp .env.example .env.local
npm run setup:db
npm run dev
```

## 📋 项目概述

**核心定位**: 全球首个专注于Sybau Lazer Dim 700风格的AI图片生成平台
**技术目标**:
- 图片处理时间 ≤8秒
- 并发处理能力 1000+ RPM
- 支持10种语言自动翻译
- 图片生成分辨率 1080px

## 🛠 核心技术栈

### 前端架构
```typescript
// 技术选型
Framework: Next.js 14 (App Router)
Language: TypeScript 5.0+
Styling: Tailwind CSS + shadcn/ui
Animation: Framer Motion
Icons: Lucide React
Forms: React Hook Form + Zod
State: Zustand (轻量状态管理)
```

### 后端服务
```typescript
// API架构
Runtime: Node.js 18+ (Vercel Serverless)
Database: PostgreSQL (Vercel Postgres/Neon)
ORM: Prisma 5.0+
Auth: NextAuth.js 4.0+
File Upload: UploadThing
Image Processing: Replicate API (推荐) / Stability AI
Translation: OpenAI GPT-4o
```

### 第三方服务集成
```env
# 必需的环境变量 (请参考 config/env.template 获取完整配置)
DATABASE_URL="[YOUR_DATABASE_CONNECTION_STRING]"
NEXTAUTH_SECRET="[GENERATE_RANDOM_32_CHAR_STRING]"
NEXTAUTH_URL="[YOUR_DOMAIN_OR_LOCALHOST]"

# 图片处理 (三选一)
REPLICATE_API_TOKEN="[YOUR_REPLICATE_TOKEN]"        # 推荐: Replicate
STABILITY_API_KEY="[YOUR_STABILITY_TOKEN]"          # 备选: Stability AI
RUNPOD_API_KEY="[YOUR_RUNPOD_TOKEN]"                # 备选: RunPod

# 翻译服务
OPENAI_API_KEY="[YOUR_OPENAI_API_KEY]"

# 文件存储
UPLOADTHING_SECRET="[YOUR_UPLOADTHING_SECRET]"
UPLOADTHING_TOKEN="[YOUR_UPLOADTHING_TOKEN]"

# 监控 (可选)
SENTRY_DSN="[YOUR_SENTRY_DSN]"
POSTHOG_KEY="[YOUR_POSTHOG_KEY]"
```

## 🗄 数据库设计与初始化

### Prisma Schema
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  password      String?   // 可选,支持第三方登录
  image         String?
  emailVerified DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // 关联
  accounts      Account[]
  sessions      Session[]
  images        GeneratedImage[]

  @@map("users")
}

model GeneratedImage {
  id              String   @id @default(cuid())
  userId          String?
  user            User?    @relation(fields: [userId], references: [id], onDelete: Cascade)

  // 图片信息
  originalUrl     String
  processedUrl    String
  thumbnailUrl    String?

  // 处理参数
  style           String   @default("classic") // classic|exaggerated|minimal
  intensity       Int      @default(2)         // 1-3
  styleVersion    String   @default("v2.1.3")

  // 统计数据
  viewCount       Int      @default(0)
  shareCount      Int      @default(0)
  downloadCount   Int      @default(0)

  // 技术数据
  processingTime  Float?   // 秒
  fileSize        Int?     // bytes
  ipHash          String?  // 用户IP哈希(匿名统计)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("generated_images")
  @@index([userId])
  @@index([createdAt])
}

model Translation {
  id          String   @id @default(cuid())
  pagePath    String   // e.g., "/", "/generator", "/about"
  langCode    String   // e.g., "en", "zh", "es"
  content     Json     // 翻译内容JSON
  lastUpdated DateTime @default(now())
  isActive    Boolean  @default(true)

  @@unique([pagePath, langCode])
  @@map("translations")
}

// NextAuth 必需表
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}
```

### 数据库初始化脚本
```bash
# scripts/setup-db.sh
#!/bin/bash
echo "🗄 设置数据库..."

# 生成Prisma客户端
npx prisma generate

# 推送数据库架构
npx prisma db push

# 创建示例数据
npx prisma db seed

echo "✅ 数据库设置完成"
```

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 创建示例翻译数据
  const translations = [
    {
      pagePath: '/',
      langCode: 'en',
      content: {
        title: 'Sybau Picture Generator | Create Viral Memes in Seconds',
        description: 'Turn any photo into hilarious Sybau Lazer Dim 700 style memes with our AI technology.',
        heroTitle: 'Create Viral Sybau Memes',
        heroSubtitle: 'Transform any photo into the iconic Sybau style in seconds'
      }
    },
    {
      pagePath: '/',
      langCode: 'zh',
      content: {
        title: 'Sybau图片生成器 | 秒速制作病毒式表情包',
        description: '使用我们的AI技术将任何照片转换成搞笑的Sybau Lazer Dim 700风格表情包。',
        heroTitle: '创作病毒式Sybau表情包',
        heroSubtitle: '几秒钟内将任何照片转换成标志性的Sybau风格'
      }
    }
  ]

  for (const translation of translations) {
    await prisma.translation.upsert({
      where: {
        pagePath_langCode: {
          pagePath: translation.pagePath,
          langCode: translation.langCode
        }
      },
      update: translation,
      create: translation
    })
  }

  console.log('✅ 示例数据创建完成')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
</rewritten_file>
