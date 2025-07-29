/**
 * 生成5个场景的专业对比图片
 * 基于用户提供的5张示例图片生成对应的before/after对比图
 */

const fs = require('fs')
const path = require('path')

// 确保目录存在
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

// 5个场景的详细配置
const scenarios = {
  photography: {
    name: '摄影',
    nameEn: 'Photography',
    beforePrompt: 'A happy family of 4 people in a modern kitchen - father, mother, grandfather, and young boy, all smiling and embracing, warm lighting, professional family portrait style',
    afterPrompt: 'A happy family of 3 people in the same modern kitchen - father, mother, and young boy, grandfather removed naturally, same warm lighting and poses, professional family portrait style',
    description: '全家福人物选择性移除，从4人全家福变成3人合影'
  },
  ecommerce: {
    name: '电商',
    nameEn: 'E-commerce', 
    beforePrompt: 'K-Swiss athletic sneakers on urban street background, concrete ground, building backdrop, natural lighting, product photography',
    afterPrompt: 'Same K-Swiss athletic sneakers with futuristic neon light background, glowing red and blue circle effects, high-tech digital backdrop, dramatic lighting, professional product display',
    description: '产品背景替换，从街道背景变成科技光效背景'
  },
  fashion: {
    name: '时尚',
    nameEn: 'Fashion',
    beforePrompt: 'Stylish woman wearing trendy sunglasses, warm golden hour lighting, cozy indoor setting, soft warm color temperature, fashion portrait',
    afterPrompt: 'Same stylish woman with same sunglasses, but with cool neon lighting, cyberpunk color grading, blue and purple tones, futuristic fashion vibe',
    description: '人物色温风格调整，从暖色调变成冷色调霓虹风格'
  },
  travel: {
    name: '旅行', 
    nameEn: 'Travel',
    beforePrompt: 'European town square with many tourists and people walking around, busy crowded scene, couple in the center, historic architecture background',
    afterPrompt: 'Same European town square but empty and peaceful, only the romantic couple embracing, no other people, serene atmosphere, historic architecture preserved',
    description: '景区路人移除，从人群拥挤变成情侣独享浪漫场景'
  },
  realestate: {
    name: '房地产',
    nameEn: 'Real Estate',
    beforePrompt: 'Cluttered living room with messy furniture arrangement, scattered items, poor lighting, cramped feeling, needs organization',
    afterPrompt: 'Same living room but perfectly organized, clean and tidy, optimal furniture placement, bright welcoming lighting, spacious and inviting atmosphere',
    description: '室内空间优化，从杂乱房间变成整洁温馨的展示空间'
  }
}

async function generateScenarioImages() {
  try {
    // 确保输出目录存在
    const outputDir = path.join(__dirname, '../public/images/scenarios')
    ensureDir(outputDir)

    console.log('🎨 开始生成5个场景的专业对比图片...')
    console.log('📁 输出目录:', outputDir)

    for (const [key, scenario] of Object.entries(scenarios)) {
      console.log(`\n🎯 生成场景: ${scenario.name} (${scenario.nameEn})`)
      console.log(`📝 描述: ${scenario.description}`)
      
      // 生成before图片
      console.log(`📸 Before提示词: ${scenario.beforePrompt}`)
      
      // 生成after图片
      console.log(`✨ After提示词: ${scenario.afterPrompt}`)
      
      // 输出文件路径
      const beforePath = path.join(outputDir, `${key}-before.webp`)
      const afterPath = path.join(outputDir, `${key}-after.webp`)
      
      console.log(`💾 输出文件:`)
      console.log(`   Before: ${beforePath}`)
      console.log(`   After: ${afterPath}`)
      
      // 注意：实际的AI图像生成需要调用Fal AI API
      // 这里先创建占位文件，实际生成需要接入AI服务
      console.log(`⏳ 需要使用AI服务生成图片...`)
    }
    
    console.log('\n✅ 场景图片生成计划完成！')
    console.log('📋 接下来需要:')
    console.log('1. 使用Fal AI或其他AI服务生成实际图片')
    console.log('2. 确保图片尺寸为800x500px')
    console.log('3. 保存为WebP格式优化加载速度')
    console.log('4. 更新UnifiedScenarioShowcase组件的图片路径')
    
  } catch (error) {
    console.error('❌ 生成场景图片时出错:', error)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  generateScenarioImages()
}

module.exports = { generateScenarioImages, scenarios }