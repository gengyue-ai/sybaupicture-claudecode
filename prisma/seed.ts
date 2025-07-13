import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 开始数据种子初始化...')

  // 1. 创建价格方案
  const plans = [
    {
      name: 'free',
      displayName: 'Free',
      description: 'Perfect for getting started',
      price: 0,
      maxImagesPerMonth: 1,
      maxResolution: '1024x1024',
      hasWatermark: true,
      hasPriorityProcessing: false,
      hasBatchProcessing: false,
      hasAdvancedFeatures: false,
      availableStyles: JSON.stringify(['classic']),
      isActive: true
    },
    {
      name: 'standard',
      displayName: 'Standard',
      description: 'Best for regular creators',
      price: 9,
      maxImagesPerMonth: 50,
      maxResolution: '1024x1024',
      hasWatermark: false,
      hasPriorityProcessing: true,
      hasBatchProcessing: false,
      hasAdvancedFeatures: true,
      availableStyles: JSON.stringify(['classic', 'exaggerated', 'professional']),
      isActive: true
    },
    {
      name: 'pro',
      displayName: 'Professional',
      description: 'For businesses and power users',
      price: 19,
      maxImagesPerMonth: 200,
      maxResolution: '2048x2048',
      hasWatermark: false,
      hasPriorityProcessing: true,
      hasBatchProcessing: true,
      hasAdvancedFeatures: true,
      availableStyles: JSON.stringify(['classic', 'exaggerated', 'professional']),
      isActive: true
    }
  ]

  console.log('🔄 创建价格方案...')
  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: {
        displayName: plan.displayName,
        description: plan.description,
        price: plan.price,
        maxImagesPerMonth: plan.maxImagesPerMonth,
        maxResolution: plan.maxResolution,
        hasWatermark: plan.hasWatermark,
        hasPriorityProcessing: plan.hasPriorityProcessing,
        hasBatchProcessing: plan.hasBatchProcessing,
        hasAdvancedFeatures: plan.hasAdvancedFeatures,
        availableStyles: plan.availableStyles,
        isActive: plan.isActive
      },
      create: plan
    })
  }

  console.log('✅ 价格方案创建完成')

  // 2. 创建核心翻译数据 (仅英文和中文)
  const translations = [
    // 英文首页
    {
      pagePath: '/',
      langCode: 'en',
      content: {
        seo: {
          title: 'Sybau Picture | Create Viral Creative Content - Stay Young, Beautiful and Unique',
          description: 'Transform text or images into stunning creative visuals with AI. Experience the Sybau culture inspired by Gen Z. Stay Young, Beautiful and Unique.',
          keywords: 'sybau picture, ai image generator, creative content, gen z, young beautiful unique, viral content'
        },
        hero: {
          title: 'Create Viral',
          subtitle: 'Creative Content',
          tagline: 'Stay Young, Beautiful and Unique',
          description: 'Transform text or images into stunning creative visuals with AI. Experience the Sybau culture inspired by Gen Z.',
          benefit1: '100% Free to Start',
          benefit2: 'Google登录',
          benefit3: 'HD Quality',
          benefit4: '8s Processing',
          supportedFormats: 'Supports JPG, PNG, WEBP up to 5MB',
          socialProof: 'Trusted by creators worldwide',
          stat1: 'Images Created',
          stat2: 'User Rating',
          stat3: 'Countries'
        },
        nav: {
          generator: 'Generator',
          gallery: 'Gallery',
          pricing: 'Pricing',
          help: 'Help',
          tryFree: 'Try Free',
          createNow: 'Create Now'
        },
        features: {
          title: 'Powerful Features for Perfect Creative Content',
          description: 'Everything you need to create viral content that resonates with your audience.',
          aiPowered: {
            title: 'AI-Powered Creative Generation',
            description: 'Advanced neural networks trained specifically for creative visual generation with perfect results every time.'
          },
          fastProcessing: {
            title: 'Ultra-Fast Processing',
            description: 'Our optimized pipeline processes your images in less than 8 seconds, making viral content creation effortless.'
          },
          multiLanguage: {
            title: '2 Languages Supported',
            description: 'Create content in your native language with our comprehensive multilingual support.'
          },
          privacyFirst: {
            title: 'Privacy First',
            description: 'Your images are automatically deleted after 24 hours. No permanent storage, maximum privacy.'
          }
        }
      }
    },
    // 中文首页
    {
      pagePath: '/',
      langCode: 'zh',
      content: {
        seo: {
          title: 'Sybau Picture | 创建病毒式创意内容 - 保持年轻、美丽和独特',
          description: '使用AI将文本或图像转换为令人惊叹的创意视觉效果。体验受Z世代启发的Sybau文化。保持年轻、美丽和独特。',
          keywords: 'sybau picture, ai图像生成器, 创意内容, z世代, 年轻美丽独特, 病毒式内容'
        },
        hero: {
          title: '创建病毒式',
          subtitle: '创意内容',
          tagline: '保持年轻、美丽和独特',
          description: '使用AI将文本或图像转换为令人惊叹的创意视觉效果。体验受Z世代启发的Sybau文化。',
          benefit1: '100% 免费开始',
          benefit2: 'Google登录',
          benefit3: '高清质量',
          benefit4: '8秒处理',
          supportedFormats: '支持JPG、PNG、WEBP格式，最大5MB',
          socialProof: '全球创作者信赖',
          stat1: '图片创建数',
          stat2: '用户评价',
          stat3: '服务国家'
        },
        nav: {
          generator: '生成器',
          gallery: '画廊',
          pricing: '定价',
          help: '帮助',
          tryFree: '免费试用',
          createNow: '立即创建'
        },
        features: {
          title: '完美创意内容的强大功能',
          description: '创建与您的受众产生共鸣的病毒式内容所需的一切。',
          aiPowered: {
            title: 'AI驱动的创意生成',
            description: '专门为创意视觉生成训练的先进神经网络，每次都能产生完美的结果。'
          },
          fastProcessing: {
            title: '超快处理',
            description: '我们优化的管道在不到8秒的时间内处理您的图像，使病毒式内容创作变得轻松。'
          },
          multiLanguage: {
            title: '支持2种语言',
            description: '通过我们全面的多语言支持，用您的母语创建内容。'
          },
          privacyFirst: {
            title: '隐私优先',
            description: '您的图像在24小时后自动删除。无永久存储，最大隐私保护。'
          }
        }
      }
    }
  ]

  console.log('🔄 创建翻译数据...')
  for (const translation of translations) {
    await prisma.translation.upsert({
      where: {
        pagePath_langCode: {
          pagePath: translation.pagePath,
          langCode: translation.langCode,
        }
      },
      update: {
        content: JSON.stringify(translation.content),
        lastUpdated: new Date(),
      },
      create: {
        pagePath: translation.pagePath,
        langCode: translation.langCode,
        content: JSON.stringify(translation.content),
        lastUpdated: new Date(),
      }
    })
  }

  console.log('✅ 翻译数据创建完成')

  console.log('🎉 数据种子初始化完成！')
  console.log('📊 创建的数据:')
  console.log(`   - ${plans.length} 个价格方案`)
  console.log(`   - ${translations.length} 个翻译页面`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ 数据种子初始化失败:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
