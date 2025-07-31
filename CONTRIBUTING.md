# 🤝 Contributing to Sybau Picture

> **Help us build the future of AI image generation!**  
> **🌐 Live Platform**: [sybaupicture.com](https://sybaupicture.com) | **🇨🇳 中文版**: [sybaupicture.com/zh](https://sybaupicture.com/zh)

---

## 🌟 Welcome Contributors!

Thank you for your interest in contributing to Sybau Picture! We're excited to work with developers, designers, and AI enthusiasts from around the world to make professional AI image generation accessible to everyone.

### 🎯 Project Mission
Sybau Picture aims to democratize professional-quality AI image generation through:
- ⚡ **Lightning-fast processing** (15-second generation)
- 🎨 **Professional templates** (9 specialized scenarios)
- 🌍 **Global accessibility** (Multi-language support)
- 💼 **Commercial-grade quality** (Enterprise-ready results)

---

## 🚀 Ways to Contribute

### 🐛 Bug Reports
Help us improve by reporting issues:
- **Search first**: Check existing issues to avoid duplicates
- **Be specific**: Include steps to reproduce, expected vs. actual behavior
- **Provide context**: Browser, OS, device details
- **Include screenshots**: Visual evidence helps immensely

### ✨ Feature Requests
Share your ideas for new features:
- **Problem statement**: What problem does this solve?
- **Use cases**: How would users benefit?
- **Implementation ideas**: Technical suggestions welcome
- **Business impact**: How does this align with our mission?

### 🔧 Code Contributions
Contribute to the codebase:
- **Frontend**: React/Next.js components and UI improvements
- **Backend**: API endpoints and business logic
- **AI Integration**: Enhanced model integration and optimization
- **Performance**: Speed and efficiency improvements
- **Testing**: Comprehensive test coverage
- **Documentation**: Code documentation and examples

### 📚 Documentation
Help improve our documentation:
- **User guides**: Tutorial improvements and new guides
- **Developer docs**: API documentation and technical guides
- **Translations**: Multi-language documentation support
- **Examples**: Real-world usage examples and case studies

### 🎨 Design Contributions
Enhance the user experience:
- **UI/UX improvements**: Interface design enhancements
- **Visual assets**: Icons, illustrations, and graphics
- **Accessibility**: Making the platform more inclusive
- **Mobile experience**: Touch-optimized interactions

---

## 🛠️ Development Setup

### 📋 Prerequisites

#### System Requirements
- **Node.js**: Version 18.17.0 or higher
- **npm**: Latest version (comes with Node.js)
- **Git**: For version control
- **Code Editor**: VS Code recommended with extensions

#### Required Services
- **Supabase account**: For database (free tier available)
- **Fal AI API key**: For AI image generation
- **Stripe account**: For payment processing (test mode)
- **Google OAuth**: For authentication setup

### 🚀 Quick Start

#### 1. Fork and Clone
```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR-USERNAME/sybaupicture-claudecode.git
cd sybaupicture-claudecode
```

#### 2. Install Dependencies
```bash
# Install all project dependencies
npm install
```

#### 3. Environment Setup
```bash
# Copy the environment template
cp config/env.template .env.local

# Edit .env.local with your actual values
# See "Environment Variables" section below
```

#### 4. Database Setup
```bash
# Generate Prisma client, push schema, and seed data
npm run setup:db
```

#### 5. Start Development Server
```bash
# Start the development server (with smart port detection)
npm run start:smart

# Or use standard dev command
npm run dev
```

#### 6. Verify Setup
Visit `http://localhost:3001` (or the port shown in terminal) to verify everything works correctly.

### 🔑 Environment Variables

#### Core Configuration
```env
# Database
DATABASE_URL="your-supabase-postgresql-url"

# Authentication
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3001"

# Google OAuth
GOOGLE_CLIENT_ID_DEV="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET_DEV="your-google-oauth-client-secret"

# AI Service
FAL_KEY="your-fal-ai-api-key"

# Stripe (Development)
STRIPE_SECRET_KEY_DEV="your-stripe-secret-key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_DEV="your-stripe-publishable-key"
STRIPE_WEBHOOK_SECRET_DEV="your-stripe-webhook-secret"
```

#### Getting API Keys

**Supabase Setup:**
1. Visit [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string

**Fal AI Setup:**
1. Visit [fal.ai](https://fal.ai)
2. Create an account
3. Generate API key in dashboard
4. Copy the key

**Google OAuth Setup:**
1. Visit [Google Console](https://console.developers.google.com)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3001/api/auth/callback/google`

**Stripe Setup:**
1. Visit [stripe.com](https://stripe.com)
2. Create account
3. Get test API keys from dashboard
4. Set up webhook endpoint for local development

---

## 🔄 Development Workflow

### 🌿 Branch Strategy

#### Branch Naming Convention
```bash
# Feature branches
feature/add-new-template
feature/improve-mobile-ui
feature/enhance-api-performance

# Bug fix branches
fix/authentication-issue
fix/payment-processing-bug
fix/mobile-responsive-layout

# Documentation branches
docs/update-api-documentation
docs/add-contributing-guide
docs/improve-readme
```

#### Workflow Process
```bash
# 1. Create feature branch from main
git checkout main
git pull origin main
git checkout -b feature/your-feature-name

# 2. Make your changes and commit
git add .
git commit -m "feat: add new template system"

# 3. Push branch and create PR
git push origin feature/your-feature-name
# Create PR through GitHub interface
```

### 📝 Commit Message Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/) for consistent commit messages:

#### Commit Types
- **feat**: New feature or enhancement
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring without feature changes
- **test**: Adding or updating tests
- **chore**: Maintenance tasks (dependencies, build, etc.)

#### Examples
```bash
feat: add watermark removal template
fix: resolve mobile touch input issues
docs: update API documentation with new endpoints
style: improve button hover animations
refactor: optimize image processing pipeline
test: add comprehensive auth flow tests
chore: update dependencies to latest versions
```

### 🧪 Testing

#### Running Tests
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

#### Test Categories
- **Unit Tests**: Individual component and function testing
- **Integration Tests**: API endpoint and service integration
- **E2E Tests**: Complete user journey testing
- **Performance Tests**: Load and speed testing

#### Writing Tests
```typescript
// Example component test
import { render, screen } from '@testing-library/react'
import ImageGenerator from '@/components/ImageGenerator'

describe('ImageGenerator', () => {
  it('renders generation interface', () => {
    render(<ImageGenerator />)
    expect(screen.getByText('Generate Image')).toBeInTheDocument()
  })
})

// Example API test
import { POST } from '@/app/api/generate/route'

describe('/api/generate', () => {
  it('generates image successfully', async () => {
    const response = await POST(mockRequest)
    expect(response.status).toBe(200)
    expect(response.data.imageUrl).toBeDefined()
  })
})
```

### 🔍 Code Quality

#### Pre-commit Hooks
We use Husky for automated code quality checks:
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  }
}
```

#### Linting and Formatting
```bash
# Run ESLint
npm run lint

# Auto-fix ESLint issues
npm run lint:fix

# Check TypeScript types
npm run type-check

# Format code with Prettier
npm run format
```

#### Code Style Guidelines
- **TypeScript**: Use strict type checking
- **React**: Functional components with hooks
- **Naming**: Use descriptive, clear names
- **Comments**: Document complex logic and business rules
- **Performance**: Optimize for speed and efficiency

---

## 📖 Project Structure

### 🗂️ Directory Overview
```
sybau-picture/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── generate/      # Image generation endpoints
│   │   ├── auth/          # Authentication endpoints
│   │   └── payment/       # Payment processing
│   ├── (pages)/           # App pages and layouts
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── ImageGenerator.tsx # Main generation interface
│   └── Navbar.tsx        # Navigation component
├── lib/                  # Utility libraries
│   ├── auth.ts           # Authentication configuration
│   ├── stripe.ts         # Payment processing
│   └── utils.ts          # General utilities
├── prisma/               # Database schema and migrations
├── public/               # Static assets
└── docs/                 # Documentation
```

### 🔧 Key Files
- **`app/layout.tsx`**: Root layout and providers
- **`app/page.tsx`**: Homepage component
- **`components/ImageGenerator.tsx`**: Core generation interface
- **`lib/auth.ts`**: NextAuth.js configuration
- **`prisma/schema.prisma`**: Database schema
- **`next.config.js`**: Next.js configuration

---

## 🎨 Design System

### 🎯 Design Principles
- **Simplicity**: Clean, intuitive interfaces
- **Speed**: Fast, responsive interactions
- **Accessibility**: Inclusive design for all users
- **Consistency**: Unified visual language
- **Professional**: Business-grade appearance

### 🖼️ Visual Guidelines
- **Colors**: Purple/pink/cyan gradient theme
- **Typography**: Clear, readable fonts
- **Spacing**: Consistent 8px grid system
- **Icons**: Lucide React icon library
- **Animations**: Smooth, purposeful transitions

### 📱 Responsive Design
- **Mobile First**: Design for mobile, enhance for desktop
- **Breakpoints**: Standard Tailwind CSS breakpoints
- **Touch Targets**: Minimum 44px for touch elements
- **Performance**: Optimized images and assets

---

## 🔐 Security Guidelines

### 🛡️ Security Best Practices
- **Input Validation**: Sanitize all user inputs
- **Authentication**: Secure session management
- **Authorization**: Proper access control
- **Data Protection**: Encrypt sensitive data
- **API Security**: Rate limiting and abuse prevention

### 🔒 Sensitive Data Handling
- **Environment Variables**: Never commit secrets
- **API Keys**: Use environment-specific keys
- **User Data**: Minimal data collection, secure storage
- **Payment Data**: PCI DSS compliance via Stripe

### 🚨 Security Reporting
If you discover security vulnerabilities:
1. **Do not** open public issues
2. **Contact**: [Security Contact](https://sybaupicture.com/contact)
3. **Include**: Detailed reproduction steps
4. **Response**: We'll respond within 48 hours

---

## 🌍 Internationalization

### 🔤 Adding New Languages
1. **Create translation files**: `lib/translations/[locale].ts`
2. **Update routing**: Add locale to middleware
3. **Test thoroughly**: Verify UI layout and functionality
4. **Document changes**: Update relevant documentation

### 📝 Translation Guidelines
- **Context**: Provide context for translators
- **Pluralization**: Handle plural forms correctly
- **Cultural Adaptation**: Consider cultural differences
- **Technical Terms**: Maintain consistency in technical vocabulary

---

## 📈 Performance Guidelines

### ⚡ Performance Best Practices
- **Image Optimization**: Use Next.js Image component
- **Code Splitting**: Dynamic imports for large components
- **Caching**: Strategic caching at multiple levels
- **Bundle Size**: Monitor and optimize bundle size
- **Core Web Vitals**: Maintain excellent performance scores

### 📊 Performance Monitoring
- **Lighthouse**: Regular performance audits
- **Vercel Analytics**: Production performance monitoring
- **Bundle Analyzer**: Bundle size analysis
- **Load Testing**: Stress testing for scalability

---

## 🤖 AI Integration Guidelines

### 🧠 Working with AI Services
- **Error Handling**: Robust error handling for AI failures
- **Rate Limiting**: Respect API rate limits
- **Cost Optimization**: Efficient API usage
- **Quality Assurance**: Validate AI output quality
- **Fallback Strategies**: Handle service outages gracefully

### 🔄 Adding New AI Features
1. **Research**: Evaluate AI service capabilities
2. **Prototype**: Build proof of concept
3. **Integration**: Implement with proper error handling
4. **Testing**: Comprehensive testing with various inputs
5. **Documentation**: Document API usage and limitations

---

## 📋 Pull Request Process

### 🔍 Before Submitting
- [ ] **Tests pass**: All tests passing locally
- [ ] **Linting clean**: No ESLint errors or warnings
- [ ] **Type checking**: No TypeScript errors
- [ ] **Manual testing**: Feature works as expected
- [ ] **Documentation**: Update relevant documentation
- [ ] **Performance**: No significant performance regressions

### 📝 PR Description Template
```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots
[Add screenshots if applicable]

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added for new functionality
```

### 🔄 Review Process
1. **Automated Checks**: CI/CD pipeline runs automatically
2. **Code Review**: Project maintainers review code
3. **Testing**: Manual testing in staging environment
4. **Approval**: PR approved by maintainers
5. **Merge**: Changes merged to main branch
6. **Deployment**: Automatic deployment to production

---

## 🏆 Recognition

### 🌟 Contributor Hall of Fame
We recognize contributors in multiple ways:
- **README Credits**: Featured in project README
- **Release Notes**: Mentioned in release announcements
- **Social Media**: Highlighted on our social platforms
- **Swag**: Sybau Picture merchandise for significant contributions

### 📊 Contribution Types
- **Code**: New features, bug fixes, optimizations
- **Documentation**: Guides, tutorials, API docs
- **Design**: UI/UX improvements, visual assets
- **Testing**: Test coverage, quality assurance
- **Community**: Issue triage, user support
- **Outreach**: Blog posts, conference talks

---

## 📞 Getting Help

### 💬 Communication Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Website**: [Contact Us](https://sybaupicture.com/contact)
- **Discord**: [Join our community](https://discord.gg/sybaupicture) (coming soon)

### 📚 Resources
- **Live Platform**: [sybaupicture.com](https://sybaupicture.com)
- **Documentation**: [GitHub Wiki](https://github.com/gengyue-ai/sybaupicture-claudecode/wiki)
- **API Reference**: Coming soon
- **Video Tutorials**: YouTube channel (coming soon)

### 🆘 Getting Support
If you're stuck:
1. **Search existing issues**: Someone may have faced the same problem
2. **Check documentation**: Comprehensive guides available
3. **Ask questions**: Create a GitHub Discussion
4. **Contact us**: Email for urgent issues

---

## 📄 Code of Conduct

### 🤝 Our Commitment
We are committed to providing a welcoming and inclusive environment for all contributors, regardless of:
- Experience level
- Gender identity and expression
- Sexual orientation
- Disability
- Personal appearance
- Body size
- Race
- Ethnicity
- Age
- Religion
- Nationality

### ✅ Expected Behavior
- **Be respectful**: Treat others with respect and kindness
- **Be inclusive**: Welcome newcomers and diverse perspectives
- **Be constructive**: Provide helpful feedback and suggestions
- **Be patient**: Remember everyone is learning
- **Be professional**: Maintain professional communication

### ❌ Unacceptable Behavior
- Harassment or discriminatory language
- Personal attacks or trolling
- Spam or excessive self-promotion
- Sharing private information without permission
- Any behavior that creates an unwelcoming environment

### 🚨 Reporting Issues
If you experience or witness unacceptable behavior:
- **Contact**: [Report Issues](https://sybaupicture.com/contact)
- **Confidential**: All reports handled confidentially
- **Response**: We'll respond within 24 hours

---

## 📜 Legal

### 📄 License
By contributing to Sybau Picture, you agree that your contributions will be licensed under the same license as the project (MIT License).

### 🔏 Contributor License Agreement
- You have the right to submit your contributions
- You grant us perpetual, worldwide license to use your contributions
- Your contributions don't violate any third-party rights
- You understand contributions may be modified or rejected

### 🛡️ Intellectual Property
- Respect third-party intellectual property
- Don't include copyrighted code without permission
- Ensure contributions are your original work
- Follow fair use guidelines for external resources

---

## 🎉 Thank You!

Thank you for considering contributing to Sybau Picture! Your contributions help make professional AI image generation accessible to creators worldwide.

### 🌟 Ready to Contribute?

[![🚀 Start Contributing](https://img.shields.io/badge/🚀_Start_Contributing-Fork_Now-success?style=for-the-badge)](https://github.com/gengyue-ai/sybaupicture-claudecode/fork)
[![💬 Join Discussion](https://img.shields.io/badge/💬_Join_Discussion-GitHub_Discussions-blue?style=for-the-badge)](https://github.com/gengyue-ai/sybaupicture-claudecode/discussions)
[![🌐 Try Platform](https://img.shields.io/badge/🌐_Try_Platform-sybaupicture.com-orange?style=for-the-badge)](https://sybaupicture.com)

*Building the Future of AI Image Generation Together* 🚀