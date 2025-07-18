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

### Deployment Commands
```bash
# Standard Vercel deployment
vercel --prod

# With deployment script
./deploy-to-production.sh
```

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

### Configuration Management
- **`lib/config.ts`**: Centralized configuration with environment-specific fallbacks
- **`config/env.template`**: Complete environment variable reference and documentation