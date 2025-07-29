/**
 * 为BeforeAfterSlider生成完全一致的场景对比图片
 * 使用图生图模式确保基本元素完全一致，适配拉动条效果
 */

const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')

// 5个场景的精确配置 - 专为BeforeAfterSlider设计
const scenarios = [
  {
    key: 'photography',
    name: '摄影场景 - 全家福人物移除（5→2人）',
    beforePrompt: 'Professional family portrait in modern kitchen: 5 people standing around wooden kitchen island - father in beige shirt, mother in denim jacket, grandfather in white shirt, grandmother in light sweater, young boy in burgundy sweater in center, all embracing and smiling, warm natural lighting from large window, shot from waist up, centered composition, high quality family photography',
    afterPrompt: 'Same exact kitchen, same lighting, same camera angle and distance, same wooden island - keep only grandfather in white shirt and grandmother in light sweater in center, naturally remove father, mother and young boy while maintaining the same warm poses and composition, sweet elderly couple portrait',
    intensity: 2
  },
  {
    key: 'ecommerce', 
    name: '电商场景 - 产品背景替换',
    beforePrompt: 'Professional product photography: white Nike Air Force 1 sneakers positioned at exactly 45-degree angle facing camera-right, sitting centered on clean white surface, neutral light gray studio background, commercial lighting setup, high resolution product shot, 800x500 aspect ratio',
    afterPrompt: 'Exact same white Nike Air Force 1 sneakers in identical 45-degree position and angle, same camera distance and framing, but transform background to futuristic cyberpunk environment with glowing blue and purple neon circles, dramatic sci-fi lighting effects while keeping product completely unchanged',
    intensity: 3
  },
  {
    key: 'fashion',
    name: '时尚场景 - 人物色温调整', 
    beforePrompt: 'Portrait of young Asian woman with shoulder-length brown hair, wearing stylish aviator sunglasses and black leather jacket, sitting in modern cafe, warm golden hour lighting creating cozy atmosphere, shot from chest up, centered composition, professional fashion photography',
    afterPrompt: 'Same exact woman with same brown hair, same aviator sunglasses, same black leather jacket, same sitting pose in same cafe location, identical camera angle and framing, but transform lighting to cool cyberpunk neon effects with blue and purple color temperature, dramatic mood lighting',
    intensity: 2
  },
  {
    key: 'travel',
    name: '旅行场景 - 景区路人移除',
    beforePrompt: 'European medieval town square with romantic couple embracing in exact center - man in dark jacket, woman in orange coat, surrounded by many tourists and people walking around, historic colorful buildings in background, cobblestone ground, daylight photography, shot from medium distance',
    afterPrompt: 'Same exact European town square from identical camera angle and distance, same romantic couple in same center position with same embrace pose, same historic buildings and cobblestones, but remove all background tourists and people, creating peaceful empty square atmosphere',
    intensity: 2
  },
  {
    key: 'realestate',
    name: '房地产场景 - 桌面整理',
    beforePrompt: 'Interior shot of modern dining room focusing on large wooden table covered with many scattered items - books, papers, coffee cups, plates, magazines, keys, remote controls creating cluttered appearance, natural daylight from window, realistic home photography, shot from standing height',
    afterPrompt: 'Same exact wooden dining table in same room from identical camera angle and lighting, same window and background, but clean and organized table surface with only one elegant white ceramic teapot as centerpiece, all other items removed, professional home staging appearance',
    intensity: 2
  }
]

// 确保目录存在
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    console.log(`📁 创建目录: ${dir}`)
  }
}

// 生成文生图（第一步）
async function generateTextToImage(prompt, filename) {
  console.log(`🎨 生成Before图片: ${filename}`)
  console.log(`📝 提示词: ${prompt.substring(0, 100)}...`)
  
  try {
    const response = await fetch('http://localhost:3003/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': 'showcase-2025-secret-key-dev-only'
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

    console.log(`✅ Before图片生成成功: ${data.imageUrl}`)
    return data.imageUrl
    
  } catch (error) {
    console.error(`❌ 生成Before图片失败 ${filename}:`, error.message)
    return null
  }
}

// 生成图生图（第二步）- 关键：保持主体一致性
async function generateImageToImage(baseImageUrl, prompt, intensity, filename) {
  console.log(`✨ 基于Before图生成After图片: ${filename}`)
  console.log(`📝 变化提示: ${prompt.substring(0, 100)}...`)
  console.log(`🎚️ 变化强度: ${intensity} (低强度保持一致性)`)
  
  try {
    // 首先下载基础图片
    const imageResponse = await fetch(baseImageUrl)
    const imageBuffer = await imageResponse.buffer()
    
    // 创建FormData用于图生图
    const FormData = require('form-data')
    const formData = new FormData()
    
    formData.append('mode', 'image-to-image')
    formData.append('file', imageBuffer, { filename: 'base.jpg' })
    formData.append('prompt', prompt)
    formData.append('style', 'professional')
    formData.append('intensity', intensity.toString())
    formData.append('width', '800')
    formData.append('height', '500')

    const response = await fetch('http://localhost:3003/api/generate', {
      method: 'POST',
      headers: {
        'x-admin-secret': 'showcase-2025-secret-key-dev-only'
      },
      body: formData
    })

    if (!response.ok) {
      throw new Error(`图生图API失败: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.imageUrl) {
      throw new Error('图生图API返回数据中没有imageUrl')
    }

    console.log(`✅ After图片生成成功: ${data.imageUrl}`)
    return data.imageUrl
    
  } catch (error) {
    console.error(`❌ 生成After图片失败 ${filename}:`, error.message)
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

// 生成单个场景的一致性图片对
async function generateScenarioPair(scenario, outputDir) {
  console.log(`\n🎯 处理场景: ${scenario.name}`)
  console.log('=' .repeat(80))
  
  try {
    // 第一步：生成Before图片（文生图）
    console.log(`\n📸 第一步：生成基础图片...`)
    const beforeUrl = await generateTextToImage(scenario.beforePrompt, `${scenario.key}-before.webp`)
    
    if (!beforeUrl) {
      throw new Error('Before图片生成失败')
    }
    
    // 下载Before图片
    const beforePath = path.join(outputDir, `${scenario.key}-before.webp`)
    const beforeSaved = await downloadImage(beforeUrl, beforePath)
    
    if (!beforeSaved) {
      throw new Error('Before图片下载失败')
    }
    
    // 等待5秒避免API限制
    console.log('⏳ 等待5秒...')
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    // 第二步：基于Before图生成After图片（图生图）
    console.log(`\n✨ 第二步：基于基础图生成变化图片...`)
    const afterUrl = await generateImageToImage(beforeUrl, scenario.afterPrompt, scenario.intensity, `${scenario.key}-after.webp`)
    
    if (!afterUrl) {
      throw new Error('After图片生成失败')
    }
    
    // 下载After图片
    const afterPath = path.join(outputDir, `${scenario.key}-after.webp`)
    const afterSaved = await downloadImage(afterUrl, afterPath)
    
    if (!afterSaved) {
      throw new Error('After图片下载失败')
    }
    
    console.log(`🎉 ${scenario.name} 完成！`)
    console.log(`📁 Before: ${beforePath}`)
    console.log(`📁 After: ${afterPath}`)
    
    return {
      key: scenario.key,
      name: scenario.name,
      beforePath,
      afterPath,
      beforeUrl,
      afterUrl,
      success: true
    }
    
  } catch (error) {
    console.error(`❌ ${scenario.name} 处理失败:`, error.message)
    return {
      key: scenario.key,
      name: scenario.name,
      success: false,
      error: error.message
    }
  }
}

// 生成所有场景
async function generateAllConsistentScenarios() {
  console.log('🚀 开始生成BeforeAfterSlider专用的一致性场景图片...')
  console.log('🎯 使用图生图模式确保基本元素完全一致')
  console.log('🌐 API地址: http://localhost:3003/api/generate\n')
  
  // 确保输出目录存在
  const outputDir = path.join(__dirname, '../public/images/scenarios')
  ensureDir(outputDir)
  
  const results = []
  
  for (let i = 0; i < scenarios.length; i++) {
    const scenario = scenarios[i]
    console.log(`\n🎬 处理进度: ${i + 1}/${scenarios.length}`)
    
    const result = await generateScenarioPair(scenario, outputDir)
    results.push(result)
    
    // 场景间等待8秒
    if (i < scenarios.length - 1) {
      console.log('\n⏳ 等待8秒后继续下一个场景...')
      await new Promise(resolve => setTimeout(resolve, 8000))
    }
  }
  
  // 显示最终结果
  console.log('\n' + '='.repeat(80))
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
  console.log('🎭 这些图片专为BeforeAfterSlider设计，确保拉动条效果完美！')
  
  return results
}

// 如果直接运行此脚本
if (require.main === module) {
  generateAllConsistentScenarios().catch(console.error)
}

module.exports = { generateAllConsistentScenarios, scenarios }