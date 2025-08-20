# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sybau Picture is a modern AI image generation platform built with Next.js 14, featuring Google OAuth authentication, Stripe subscription management, and Fal AI integration for image generation. The project uses an intelligent environment management system to separate development and production configurations.

## Core Architecture

### Environment Management System
- **Smart Environment Manager**: `lib/config.ts` handles automatic environment detection (development/production)
- **Configuration Separation**: Different API keys and secrets for dev/prod environments using suffixed environment variables  
- **Command-line Tools**: Chinese command support through `scripts/smart-env.js` for environment switching

### Authentication & User Management
- **NextAuth.js**: Google OAuth integration with environment-specific client IDs
- **Session Strategy**: JWT-based sessions with automatic database synchronization
- **User Sync**: Automatic user creation/updates in database during authentication flow

### Database Layer
- **Prisma ORM**: PostgreSQL database with comprehensive schema for users, subscriptions, image generation tracking
- **Supabase**: Production database with local development support
- **Models**: User, Plan, Subscription, GeneratedImage, UserUsage with proper relationships

### Payment & Subscription
- **Stripe Integration**: Full subscription lifecycle management with webhook support
- **Plan Management**: Three-tier pricing (Free, Standard, Pro) with usage limits
- **Environment-specific Keys**: Separate Stripe keys for development and production

### AI Image Generation
- **Fal AI**: Primary image generation service using Flux models
- **Usage Tracking**: Monthly limits based on subscription tier
- **Image Management**: Storage of generated images with metadata

## Common Development Commands

### Environment Management
```bash
# Chinese commands (preferred)
node scripts/smart-env.js 开发    # Switch to development
node scripts/smart-env.js 生产    # Switch to production  
node scripts/smart-env.js 状态    # Check environment status

# English equivalents
npm run env:dev                  # Switch to development
npm run env:prod                 # Switch to production
npm run env:status               # Check status
```

### Development Workflow
```bash
# Smart startup (auto port conflict resolution)
npm run start:smart

# Standard development
npm run dev                      # Start dev server on port 3001

# Building and testing
npm run build                    # Production build with Prisma generate
npm run type-check              # TypeScript type checking
npm run lint                    # ESLint code checking
```

### Database Operations
```bash
npm run db:generate             # Generate Prisma client
npm run db:push                 # Push schema to database  
npm run db:seed                 # Seed initial data (plans)
npm run db:studio               # Open Prisma Studio
npm run db:reset                # Reset database and reseed
```

### Testing Commands
```bash
npm run test                    # Run Jest tests
npm run test:watch             # Run Jest tests in watch mode
npm run test:coverage          # Generate coverage report
npm run test:e2e               # Run Playwright e2e tests
```

### Additional Scripts
```bash
# Security and diagnostics
npm run stripe:check            # Check Stripe configuration
npm run git:security           # Fix Git security issues
npm run ai:memory              # Update AI memory

# Database setup
npm run setup:db               # Complete database setup with seed data
```

## Key Configuration Files

### Environment Variables
- Use `config/env.template` as reference for required environment variables
- Development keys use `_DEV` suffix (e.g., `GOOGLE_CLIENT_ID_DEV`)
- Production keys use `_PROD` suffix (e.g., `GOOGLE_CLIENT_ID_PROD`)

### Critical Environment Variables
```env
# Database
DATABASE_URL=                   # Supabase PostgreSQL URL

# Authentication  
NEXTAUTH_SECRET=               # NextAuth.js encryption secret
GOOGLE_CLIENT_ID_DEV=          # Google OAuth development client
GOOGLE_CLIENT_SECRET_DEV=      # Google OAuth development secret

# AI Service
FAL_KEY=                       # Fal AI API key

# Stripe (Development)
STRIPE_SECRET_KEY_DEV=         # Stripe development secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_DEV=  # Stripe development public key
```

## Code Architecture Patterns

### Smart Environment Detection
The `lib/config.ts` module provides:
- Automatic environment detection based on NODE_ENV and NEXTAUTH_URL
- Configuration validation with detailed error reporting
- Environment-specific service configuration loading
- Centralized configuration management for all services

### Authentication Flow
Located in `lib/auth.ts`:
- Google OAuth with automatic user database synchronization
- JWT token enhancement with subscription and usage data
- Error-tolerant database operations that don't block authentication

### API Route Structure
```
app/api/
├── auth/[...nextauth]/     # NextAuth.js authentication
├── generate/               # AI image generation
├── payment/               # Stripe checkout and portal
├── subscription/          # Subscription status
├── user/                  # User data and usage
└── webhook/stripe/        # Stripe webhook handling
```

### Component Organization
- **UI Components**: `components/ui/` - shadcn/ui components
- **Feature Components**: `components/` - ImageGenerator, Navbar, etc.
- **Page Components**: `app/` - Next.js App Router pages
- **Internationalization**: `app/zh/` - Chinese language pages

## Development Guidelines

### Environment Switching
Always use the smart environment management:
1. Check current status: `node scripts/smart-env.js 状态`
2. Switch environments before major changes
3. Verify configuration after switching

### Database Changes
1. Modify `prisma/schema.prisma`
2. Run `npm run db:push` to apply changes
3. Update seed data if needed: `npm run db:seed`

### Adding New Features
1. Consider subscription tier limitations
2. Add proper error handling and loading states
3. Implement both English and Chinese language support
4. Test in both development and production environments

### Security Considerations
- Never commit environment files (`.env*`)
- Use environment-specific API keys
- Validate user permissions for subscription-restricted features
- Sanitize user inputs in image generation

## Deployment Process

### Pre-deployment Checklist
1. Switch to production environment: `node scripts/smart-env.js 生产`
2. Verify all production environment variables are set
3. Run type check: `npm run type-check`
4. Run production build: `npm run build`
5. Test critical flows (auth, payment, image generation)

### Standard Deployment Process (2025-07-31 更新)

**🚨 重要：避免版本混乱，必须使用标准部署流程**

#### 推荐部署方式 (新增)
```bash
# 使用部署管理器 (推荐) - 包含完整的检查和验证流程
node scripts/deploy-manager.js

# 手动健康检查
node scripts/health-check.js
```

#### 传统部署方式 (仅紧急情况)
```bash
# 标准Vercel部署 - 仅在紧急情况下使用
vercel --prod

# 旧的部署脚本 (已废弃)
# ./deploy-to-production.sh
```

#### 部署前必须检查清单
1. **代码质量检查**: `npm run type-check && npm run lint`
2. **构建测试**: `npm run build`
3. **Git状态清理**: 确保没有未提交的重要更改
4. **环境配置**: `node scripts/smart-env.js 状态`

## Common Issues & Solutions

### Port Conflicts
Use `npm run start:smart` - automatically detects and resolves port conflicts

### Authentication Issues
1. Check Google OAuth configuration for current environment
2. Verify NEXTAUTH_URL matches deployment URL
3. Ensure callback URLs are properly configured in Google Console

### Database Connection Issues
1. Verify DATABASE_URL is correctly formatted
2. Check Supabase connection and permissions
3. Run `npm run db:generate` to refresh Prisma client

### Stripe Payment Issues
1. Verify environment-specific Stripe keys are configured
2. Check webhook endpoints are properly configured
3. Test with Stripe test cards in development

## File Structure Notes

- **Internationalization**: The project supports English (default) and Chinese (`/zh` prefix)
- **Environment Files**: Use `config/env.template` as reference, never commit actual `.env` files
- **Scripts**: Custom development scripts in `scripts/` directory for environment management and automation
- **Configuration**: Configuration templates in `config/` directory

## Multi-language Support

The application supports both English and Chinese:
- Default routes serve English content
- `/zh` prefix serves Chinese content  
- Language switching in navigation
- Separate page files for each language in appropriate directories

## Development Utilities

### Smart Scripts
- **`scripts/smart-env.js`**: Intelligent environment management with Chinese command support
- **`scripts/smart-startup.js`**: Automatic port conflict detection and resolution
- **`scripts/check-stripe-config.js`**: Stripe configuration validation
- **`scripts/git-security-fix.js`**: Git security hardening
- **`scripts/update-ai-memory.js`**: AI context and memory management
- **`scripts/deploy-manager.js`**: 🆕 **[2025-07-31]** 统一部署管理器，包含预检查、部署、验证全流程
- **`scripts/health-check.js`**: 🆕 **[2025-07-31]** 系统健康状态检查和监控

### Configuration Management
- **`lib/config.ts`**: Centralized configuration with environment-specific fallbacks
- **`config/env.template`**: Complete environment variable reference and documentation

## 🚀 标准部署和版本管理规范 (2025-07-31 新增)

### 版本混乱问题总结
2025年7月31日，项目遇到部署版本错乱问题：
- 早上修复的功能在生产环境中失效
- 多次失败部署导致版本不一致
- 缺乏部署验证机制导致问题发现延迟
- 没有标准的回滚和追踪机制

### 新的部署流程规范

#### 1. 强制使用部署管理器
```bash
# ✅ 正确的部署方式
node scripts/deploy-manager.js

# ❌ 禁止直接使用 (除非紧急情况)
vercel --prod
```

#### 2. 部署管理器功能
- **预部署检查**: 自动执行类型检查、代码检查、构建测试
- **版本标记**: 自动生成包含日期和功能描述的Git标签
- **部署验证**: 部署后自动验证系统健康状态
- **部署日志**: 详细记录每次部署的变更和验证结果
- **失败处理**: 部署失败时提供明确的错误信息和建议

#### 3. Git工作流规范
git checkout -b feature/fix-user-plan-display-2025-07-31
git checkout -b hotfix/payment-button-issue-2025-07-31

# 提交消息格式 (必须遵循)
git commit -m "feat: [2025-07-31] 修复用户套餐显示问题"
git commit -m "fix: [2025-07-31] 修复支付按钮重复调用"
git commit -m "deploy: [2025-07-31] 修复用户认证和支付功能"
```

#### 4. 部署后验证检查
每次部署后必须验证：
- **健康检查通过**: `node scripts/health-check.js`
- **关键用户功能**: 40863666@qq.com 用户套餐显示正确
- **支付流程**: 标准版和专业版按钮功能正常
- **图片生成**: AI图片生成功能正常运行
- **认证流程**: Google OAuth登录正常

#### 5. 回滚机制
```bash
# 查看部署历史和标签
git tag -l "deploy-*" --sort=-version:refname | head -10

# 快速回滚到上一个稳定版本
git checkout <上一个稳定标签>
vercel --prod  # 仅在回滚时允许直接使用

# 确认回滚成功
node scripts/health-check.js
```

#### 6. 部署日志追踪
所有部署记录保存在 `docs/deployment-log.md`，包含：
- 部署时间和描述
- Git提交信息和分支
- 预部署检查结果
- 验证测试结果
- 手动验证清单状态

### 防止版本混乱的关键措施

1. **单一部署入口**: 所有生产部署必须通过 `deploy-manager.js`
2. **自动标记**: 每次部署自动创建带时间戳的Git标签
3. **强制验证**: 部署后自动执行健康检查和功能验证
4. **详细日志**: 完整记录每次部署的前后状态
5. **快速回滚**: 出现问题时能立即回滚到稳定版本

### API健康检查端点
- **`/api/health`**: 系统健康状态检查
  - 数据库连接状态
  - 关键服务配置检查
  - 第三方服务集成状态
  - 系统性能指标

### 紧急情况处理
当遇到类似2025-07-31的版本混乱时：
1. 立即停止所有新的部署操作
2. 使用 `git tag -l "deploy-*"` 查看最近的稳定版本
3. 回滚到最后一个已验证的稳定版本
4. 执行健康检查确认回滚成功
5. 分析问题原因，更新防护措施
6. 重新进行修复，使用标准部署流程
- to memorize