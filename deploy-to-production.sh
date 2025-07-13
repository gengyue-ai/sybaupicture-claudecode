#!/bin/bash

# 🚀 Sybau Picture 生产环境部署脚本

echo "🚀 开始部署 Sybau Picture 到生产环境..."

# 1. 检查是否有未提交的更改
echo "📋 检查Git状态..."
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  检测到未提交的更改，正在添加到Git..."

    # 添加所有更改
    git add .

    # 提交更改
    echo "📝 提交更改到Git..."
    git commit -m "🚀 Production deployment: Complete feature implementation

✅ 完成的功能:
- 用户认证系统 (Google OAuth)
- AI图片生成 (Fal AI集成)
- 订阅和鉴权系统
- Stripe支付集成
- 数据库集成 (Supabase)
- 多语言支持 (中文/英文)

🔧 技术改进:
- 修复用户头像显示问题
- 优化套餐配置 (免费1张/月，无水印)
- 完善错误处理和用户体验
- 清理临时文件和调试代码

💳 支付功能:
- 完整的Stripe支付流程
- 订阅管理和客户门户
- Webhook事件处理
- 套餐升级/降级

🛡️ 安全特性:
- API路由保护
- 用户权限验证
- 支付安全验证
- 环境变量保护

📊 准备就绪进入生产环境!"

else
    echo "✅ Git状态干净，无未提交更改"
fi

# 2. 推送到远程仓库
echo "📤 推送代码到GitHub..."
git push origin master

if [ $? -eq 0 ]; then
    echo "✅ 代码成功推送到GitHub"
else
    echo "❌ 推送失败，请检查网络连接和仓库权限"
    exit 1
fi

# 3. 检查环境变量文件
echo "🔍 检查环境变量配置..."
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local 文件不存在，请创建并配置环境变量"
    echo "📋 需要的环境变量请参考 production-deployment-checklist.md"
fi

# 4. 构建检查
echo "🔨 检查项目构建..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 项目构建成功"
else
    echo "❌ 项目构建失败，请检查代码错误"
    exit 1
fi

# 5. 显示部署后需要做的事情
echo ""
echo "🎯 GitHub推送完成！现在需要手动完成以下步骤："
echo ""
echo "📋 Vercel部署步骤:"
echo "1. 登录 Vercel Dashboard"
echo "2. 连接到您的GitHub仓库"
echo "3. 配置环境变量 (参考 production-deployment-checklist.md)"
echo "4. 部署到生产环境"
echo ""
echo "🏪 Stripe生产环境配置:"
echo "1. 登录 Stripe Dashboard"
echo "2. 切换到生产模式"
echo "3. 创建产品和价格 (参考 STRIPE_PRODUCTS_SETUP.md)"
echo "4. 配置Webhook (参考 STRIPE_WEBHOOK_SETUP.md)"
echo "5. 更新Vercel环境变量中的Stripe配置"
echo ""
echo "🔐 Google OAuth生产环境:"
echo "1. 登录 Google Cloud Console"
echo "2. 添加生产域名到授权域名列表"
echo "3. 更新OAuth重定向URI"
echo ""
echo "🧪 部署后测试:"
echo "1. 验证所有功能正常工作"
echo "2. 测试完整的支付流程"
echo "3. 确认用户认证和权限控制"
echo "4. 检查AI图片生成功能"
echo ""
echo "🎉 项目代码已准备就绪！按照上述步骤完成生产环境配置。"
echo ""
echo "📚 详细部署指南请查看: production-deployment-checklist.md"
