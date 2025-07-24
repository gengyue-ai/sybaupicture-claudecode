#!/bin/bash

# 🚀 Sybau Picture - 生产环境AI功能修复部署脚本

echo "🎯 开始部署AI功能修复到生产环境..."

# 1. 确保生产环境配置
echo "🔧 确认环境配置..."
node scripts/smart-env.js 生产

# 2. 验证配置状态
echo "🔍 验证配置状态..."
node scripts/smart-env.js 状态

# 3. 部署到Vercel
echo "🚀 部署到生产环境..."
vercel --prod

echo "✅ 部署完成！"
echo ""
echo "🎨 修复内容："
echo "  ✅ 修复了ImageGenerator组件的加载状态逻辑"
echo "  ✅ 添加了生产环境Google OAuth配置"
echo "  ✅ 修正了Stripe配置变量映射"
echo "  ✅ 增强了错误日志和调试信息"
echo ""
echo "🔗 生产地址: https://sybaupicture.com"
echo "💡 用户现在应该能正常使用AI图片生成功能了！"