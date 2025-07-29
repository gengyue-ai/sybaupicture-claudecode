/**
 * 首页场景快速生成脚本 - 基于昨天画廊成功配置
 * 优化分辨率: 900x600 (比画廊800x500高一点)
 * 保持快速text-to-image模式，避免图生图的一致性问题
 */

const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')

// 5个首页场景的优化配置 - 基于画廊成功参数
const scenarios = [
  {
    key: 'photography',
    name: '摄影场景 - 全家福人物编辑',
    beforePrompt: 'Professional family portrait in modern bright kitchen: 5 people standing around wooden kitchen island - father in beige casual shirt, mother in denim jacket, elderly grandfather in white polo shirt, elderly grandmother in light cream sweater, young boy in burgundy sweater, all embracing and smiling warmly, natural daylight from large windows, shot from waist up, centered composition, high quality family photography, 900x600 aspect ratio',
    afterPrompt: 'Same modern bright kitchen, same wooden island, same lighting - but showing only 2 people: elderly grandfather in white polo shirt and elderly grandmother in light cream sweater embracing sweetly in center, same warm expressions, same camera angle and distance, cozy grandparents portrait, natural daylight, professional family photography, 900x600 aspect ratio'
  },
  {
    key: 'ecommerce', 
    name: '电商场景 - 产品背景替换',
    beforePrompt: 'Professional product photography: white Nike athletic sneakers positioned at 45-degree angle facing right, centered on clean minimal white surface, neutral gray studio background, commercial lighting setup, high resolution product shot, detailed shoe texture, 900x600 aspect ratio',
    afterPrompt: 'Same white Nike sneakers in identical 45-degree position and lighting, but background transformed to futuristic cyberpunk environment with glowing neon blue and purple circles, dramatic sci-fi lighting effects, high-tech product display, 900x600 aspect ratio'
  },
  {
    key: 'fashion',
    name: '时尚场景 - 人物色温调整',
    beforePrompt: 'Portrait of stylish young Asian woman with shoulder-length brown hair, wearing trendy aviator sunglasses and black leather jacket, sitting in modern minimalist cafe, warm golden hour lighting creating cozy atmosphere, shot from chest up, centered composition, professional fashion photography, 900x600 aspect ratio',
    afterPrompt: 'Same stylish Asian woman with same brown hair, same aviator sunglasses, same black leather jacket, same sitting pose in same cafe, identical composition, but transformed with cool cyberpunk neon lighting effects in blue and purple tones, dramatic futuristic mood lighting, 900x600 aspect ratio'
  },
  {
    key: 'travel',
    name: '旅行场景 - 景区路人移除', 
    beforePrompt: 'European medieval town square with romantic couple embracing in center - man in dark navy jacket, woman in bright orange coat, surrounded by many tourists and people walking around, historic colorful buildings backdrop, cobblestone ground, daylight photography, bustling atmosphere, 900x600 aspect ratio',
    afterPrompt: 'Same European medieval town square from identical perspective, same romantic couple in same center position with same embrace, same historic buildings and cobblestones, but completely empty and peaceful with no background people, serene quiet atmosphere, intimate romantic moment, 900x600 aspect ratio'
  },
  {
    key: 'realestate',
    name: '房地产场景 - 室内空间优化',
    beforePrompt: 'Interior shot of modern dining room with large wooden table covered in clutter - scattered books, papers, coffee cups, plates, magazines, keys, remote controls creating messy appearance, natural daylight from window, realistic home photography, shot from standing height, 900x600 aspect ratio',
    afterPrompt: 'Same modern dining room from identical camera angle, same wooden table, same window lighting, but table surface clean and organized with only one elegant white ceramic teapot as centerpiece, all clutter removed, professional home staging appearance, 900x600 aspect ratio'
  }
]

// 确保目录存在
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    console.log(`📁 创建目录: ${dir}`)
  }
}

// 快速生成单张图片 - 基于画廊成功配置
async function generateImageFast(prompt, filename) {
  console.log(`🎨 快速生成: ${filename}`)
  console.log(`📝 提示词: ${prompt.substring(0, 80)}...`)
  
  try {
    const response = await fetch('http://localhost:3003/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': 'showcase-2025-secret-key-dev-only'
      },
      body: JSON.stringify({
        mode: 'text-to-image',          // 使用快速的文生图模式
        prompt: prompt,
        style: 'professional',          // 画廊成功配置
        intensity: 4,                   // 画廊成功配置
        width: 900,                     // 比画廊800x500高一点
        height: 600
      })
    })

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.imageUrl) {
      throw new Error('API返回数据中没有imageUrl')
    }

    console.log(`✅ 快速生成成功: ${data.imageUrl}`)
    return data.imageUrl
    
  } catch (error) {
    console.error(`❌ 生成失败 ${filename}:`, error.message)
    return null
  }
}

// 下载图片到本地
async function downloadImage(url, filepath) {
  try {
    console.log(`📥 下载: ${path.basename(filepath)}`)
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`下载失败: ${response.statusText}`)
    }
    
    const buffer = await response.buffer()
    fs.writeFileSync(filepath, buffer)
    
    console.log(`💾 已保存: ${filepath}`)
    return true
    
  } catch (error) {
    console.error(`❌ 下载失败 ${url}:`, error.message)
    return false
  }
}

// 生成所有首页场景 - 快速模式
async function generateHomepageScenariosFast() {
  console.log('🚀 开始快速生成首页5个场景图片...')
  console.log('⚡ 使用画廊成功配置: text-to-image + professional + intensity 4')
  console.log('📐 分辨率优化: 900x600 (比画廊800x500高一点)')
  console.log('🌐 API地址: http://localhost:3003/api/generate\n')
  
  // 确保输出目录存在
  const outputDir = path.join(__dirname, '../public/images/scenarios')
  ensureDir(outputDir)
  
  const results = []
  const startTime = Date.now()
  
  for (let i = 0; i < scenarios.length; i++) {
    const scenario = scenarios[i]
    console.log(`\n🎯 场景 ${i + 1}/${scenarios.length}: ${scenario.name}`)
    console.log('=' .repeat(60))
    
    try {
      // 生成Before图片
      console.log(`\n📸 生成Before图片...`)
      const beforeUrl = await generateImageFast(scenario.beforePrompt, `${scenario.key}-before.webp`)
      
      if (beforeUrl) {
        // 下载Before图片
        const beforePath = path.join(outputDir, `${scenario.key}-before.webp`)
        const beforeSaved = await downloadImage(beforeUrl, beforePath)
        
        if (beforeSaved) {
          // 等待3秒 - 与画廊相同的成功间隔
          console.log('⏳ 等待3秒...')
          await new Promise(resolve => setTimeout(resolve, 3000))
          
          // 生成After图片
          console.log(`\n✨ 生成After图片...`)
          const afterUrl = await generateImageFast(scenario.afterPrompt, `${scenario.key}-after.webp`)
          
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
      
      // 场景间等待5秒 - 与画廊相同
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
  const endTime = Date.now()
  const totalTime = ((endTime - startTime) / 1000 / 60).toFixed(1)
  
  console.log('\n' + '='.repeat(60))
  console.log('🏁 首页场景快速生成完成!')
  console.log(`⏱️ 总用时: ${totalTime}分钟`)
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
  console.log('🎭 接下来更新UnifiedScenarioShowcase组件使用这些图片!')
  
  return results
}

// 如果直接运行此脚本
if (require.main === module) {
  generateHomepageScenariosFast().catch(console.error)
}

module.exports = { generateHomepageScenariosFast, scenarios }