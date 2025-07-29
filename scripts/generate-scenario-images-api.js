/**
 * 使用系统AI生成API创建5个场景的对比图片
 * 基于用户提供的示例图片生成专业的before/after对比效果
 */

const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch') // 需要安装: npm install node-fetch@2

// 5个场景的详细配置
const scenarios = [
  {
    key: 'photography',
    name: '摄影场景 - 全家福人物编辑',
    beforePrompt: 'A happy family of 5 people in a modern kitchen - father in beige shirt, mother in denim jacket, grandfather in white shirt, grandmother in light sweater, young boy in burgundy sweater, all smiling and embracing, warm cozy lighting, professional family portrait style, high quality, detailed faces',
    afterPrompt: 'A cozy family moment with only 2 people in the same modern kitchen - father in beige shirt embracing young boy in burgundy sweater, mother and grandparents naturally removed, maintaining same warm lighting and kitchen background, professional family portrait style, high quality, seamless editing'
  },
  {
    key: 'ecommerce',
    name: '电商场景 - 产品背景替换',
    beforePrompt: 'K-Swiss athletic sneakers on urban street background, concrete ground, city buildings backdrop, natural daylight lighting, product photography style, detailed shoe texture, professional commercial photo',
    afterPrompt: 'Same K-Swiss athletic sneakers floating on futuristic neon light background, glowing red and blue circle effects, high-tech digital backdrop, dramatic sci-fi lighting, cyberpunk style, professional product display'
  },
  {
    key: 'fashion',
    name: '时尚场景 - 色温风格调整',
    beforePrompt: 'Stylish young woman wearing trendy reflective sunglasses, warm golden hour lighting, cozy indoor setting, soft warm color temperature, natural skin tone, fashion portrait style, comfortable atmosphere',
    afterPrompt: 'Same stylish woman with same reflective sunglasses, but with cool neon lighting effects, cyberpunk color grading, blue and purple tones, futuristic fashion vibe, neon reflections in glasses, dramatic mood lighting'
  },
  {
    key: 'travel',
    name: '旅行场景 - 景区路人移除',
    beforePrompt: 'European historic town square with many tourists and people walking around, busy crowded scene, romantic couple in the center embracing, beautiful historic architecture background, daytime, lively atmosphere',
    afterPrompt: 'Same European historic town square but empty and peaceful, only the romantic couple embracing in the center, no other people visible, serene quiet atmosphere, historic architecture preserved, intimate romantic moment'
  },
  {
    key: 'realestate',
    name: '房地产场景 - 室内空间优化',
    beforePrompt: 'Cluttered messy living room with scattered items on tables, disorganized furniture arrangement, poor dim lighting, cramped feeling, needs cleaning, realistic interior photo',
    afterPrompt: 'Same living room but perfectly organized and clean, optimal furniture placement, bright welcoming lighting, spacious and inviting atmosphere, staged for real estate showing, professional interior photography'
  }
]

// 确保目录存在
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    console.log(`📁 创建目录: ${dir}`)
  }
}

// 生成单张图片
async function generateImage(prompt, filename) {
  console.log(`🎨 生成图片: ${filename}`)
  console.log(`📝 提示词: ${prompt.substring(0, 100)}...`)
  
  try {
    const response = await fetch('http://localhost:3003/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': 'showcase-2025-secret-key-dev-only', // 管理员密钥跳过认证
      },
      body: JSON.stringify({
        mode: 'text-to-image',
        prompt: prompt,
        style: 'professional',
        intensity: 4,
        width: 800,
        height: 500
      })
    })

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.imageUrl) {
      throw new Error('API返回数据中没有imageUrl')
    }

    console.log(`✅ 图片生成成功: ${data.imageUrl}`)
    return data.imageUrl
    
  } catch (error) {
    console.error(`❌ 生成图片失败 ${filename}:`, error.message)
    return null
  }
}

// 下载图片到本地
async function downloadImage(url, filepath) {
  try {
    console.log(`📥 下载图片: ${path.basename(filepath)}`)
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`下载失败: ${response.statusText}`)
    }
    
    const buffer = await response.buffer()
    fs.writeFileSync(filepath, buffer)
    
    console.log(`💾 图片已保存: ${filepath}`)
    return true
    
  } catch (error) {
    console.error(`❌ 下载图片失败 ${url}:`, error.message)
    return false
  }
}

// 生成所有场景图片
async function generateAllScenarios() {
  console.log('🚀 开始生成5个场景的专业对比图片...')
  console.log('🌐 使用本地API: http://localhost:3003/api/generate\n')
  
  // 确保输出目录存在
  const outputDir = path.join(__dirname, '../public/images/scenarios')
  ensureDir(outputDir)
  
  const results = []
  
  for (let i = 0; i < scenarios.length; i++) {
    const scenario = scenarios[i]
    console.log(`\n🎯 处理场景 ${i + 1}/${scenarios.length}: ${scenario.name}`)
    console.log('=' .repeat(60))
    
    try {
      // 生成Before图片
      console.log(`\n📸 生成Before图片...`)
      const beforeUrl = await generateImage(scenario.beforePrompt, `${scenario.key}-before.webp`)
      
      if (beforeUrl) {
        // 下载Before图片
        const beforePath = path.join(outputDir, `${scenario.key}-before.webp`)
        const beforeSaved = await downloadImage(beforeUrl, beforePath)
        
        if (beforeSaved) {
          // 等待3秒避免API限制
          console.log('⏳ 等待3秒...')
          await new Promise(resolve => setTimeout(resolve, 3000))
          
          // 生成After图片
          console.log(`\n✨ 生成After图片...`)
          const afterUrl = await generateImage(scenario.afterPrompt, `${scenario.key}-after.webp`)
          
          if (afterUrl) {
            // 下载After图片
            const afterPath = path.join(outputDir, `${scenario.key}-after.webp`)
            const afterSaved = await downloadImage(afterUrl, afterPath)
            
            if (afterSaved) {
              results.push({
                key: scenario.key,
                name: scenario.name,
                beforePath,
                afterPath,
                success: true
              })
              console.log(`🎉 ${scenario.name} 完成!`)
            }
          }
        }
      }
      
      // 场景间等待5秒
      if (i < scenarios.length - 1) {
        console.log('\n⏳ 等待5秒后继续下一个场景...')
        await new Promise(resolve => setTimeout(resolve, 5000))
      }
      
    } catch (error) {
      console.error(`❌ ${scenario.name} 处理失败:`, error.message)
      results.push({
        key: scenario.key,
        name: scenario.name,
        success: false,
        error: error.message
      })
    }
  }
  
  // 显示最终结果
  console.log('\n' + '='.repeat(60))
  console.log('🏁 所有场景处理完成!')
  console.log('📊 生成结果汇总:')
  
  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)
  
  console.log(`✅ 成功: ${successful.length}/${results.length}`)
  successful.forEach(result => {
    console.log(`   ✓ ${result.name}`)
  })
  
  if (failed.length > 0) {
    console.log(`❌ 失败: ${failed.length}/${results.length}`)
    failed.forEach(result => {
      console.log(`   ✗ ${result.name}: ${result.error}`)
    })
  }
  
  console.log(`\n📁 输出目录: ${outputDir}`)
  console.log('🎯 接下来可以在UnifiedScenarioShowcase组件中使用这些图片!')
  
  return results
}

// 如果直接运行此脚本
if (require.main === module) {
  generateAllScenarios().catch(console.error)
}

module.exports = { generateAllScenarios, scenarios }