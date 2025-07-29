/**
 * 速度优化测试脚本 - 测试不同参数组合的生成速度
 * 目标：找到用户可接受的速度和质量平衡点
 */

const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')

// 测试配置档位
const speedConfigs = [
  {
    name: '超快速档',
    config: {
      width: 400,
      height: 250,
      intensity: 1,
      style: 'classic'
    },
    target: '5-10秒'
  },
  {
    name: '快速档',
    config: {
      width: 512,
      height: 320,
      intensity: 2,
      style: 'classic'
    },
    target: '10-15秒'
  },
  {
    name: '平衡档',
    config: {
      width: 640,
      height: 400,
      intensity: 2,
      style: 'professional'
    },
    target: '15-25秒'
  },
  {
    name: '高质量档',
    config: {
      width: 800,
      height: 500,
      intensity: 3,
      style: 'professional'
    },
    target: '25-40秒'
  }
]

// 测试用的简单场景
const testScenario = {
  key: 'speed-test',
  name: '速度测试场景',
  beforePrompt: 'Professional portrait of young woman with brown hair wearing black jacket, sitting in modern cafe, warm lighting, professional photography',
  afterPrompt: 'Same woman with same brown hair and black jacket, same sitting pose in same cafe, but with cool blue neon lighting effects, cyberpunk color grading'
}

// 生成单张图片并记录时间
async function generateImageWithTiming(prompt, config, filename) {
  const startTime = Date.now()
  
  console.log(`🎨 生成图片: ${filename}`)
  console.log(`⚙️ 配置: ${config.width}x${config.height}, 强度${config.intensity}, ${config.style}`)
  console.log(`📝 提示词: ${prompt.substring(0, 80)}...`)
  
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
        style: config.style,
        intensity: config.intensity,
        width: config.width,
        height: config.height
      })
    })

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.imageUrl) {
      throw new Error('API返回数据中没有imageUrl')
    }

    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(1)

    console.log(`✅ 生成成功: ${data.imageUrl}`)
    console.log(`⏱️ 用时: ${duration}秒`)
    
    return {
      success: true,
      imageUrl: data.imageUrl,
      duration: parseFloat(duration),
      config: config
    }
    
  } catch (error) {
    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(1)
    
    console.error(`❌ 生成失败 ${filename}:`, error.message)
    console.log(`⏱️ 失败用时: ${duration}秒`)
    
    return {
      success: false,
      error: error.message,
      duration: parseFloat(duration),
      config: config
    }
  }
}

// 测试图生图模式的速度
async function testImageToImageSpeed(baseImageUrl, config, afterPrompt) {
  const startTime = Date.now()
  
  console.log(`🔄 测试图生图模式`)
  console.log(`⚙️ 配置: ${config.width}x${config.height}, 强度${config.intensity}`)
  
  try {
    // 下载基础图片
    const imageResponse = await fetch(baseImageUrl)
    const imageBuffer = await imageResponse.buffer()
    
    // 创建FormData
    const FormData = require('form-data')
    const formData = new FormData()
    
    formData.append('mode', 'image-to-image')
    formData.append('file', imageBuffer, { filename: 'base.jpg' })
    formData.append('prompt', afterPrompt)
    formData.append('style', config.style)
    formData.append('intensity', config.intensity.toString())
    formData.append('width', config.width.toString())
    formData.append('height', config.height.toString())

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

    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(1)

    console.log(`✅ 图生图成功: ${data.imageUrl}`)
    console.log(`⏱️ 图生图用时: ${duration}秒`)
    
    return {
      success: true,
      imageUrl: data.imageUrl,
      duration: parseFloat(duration),
      mode: 'image-to-image',
      config: config
    }
    
  } catch (error) {
    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(1)
    
    console.error(`❌ 图生图失败:`, error.message)
    console.log(`⏱️ 图生图失败用时: ${duration}秒`)
    
    return {
      success: false,
      error: error.message,
      duration: parseFloat(duration),
      mode: 'image-to-image',
      config: config
    }
  }
}

// 运行速度测试
async function runSpeedTest() {
  console.log('🚀 开始API速度优化测试...')
  console.log('🎯 目标：找到用户可接受的速度和质量平衡点\n')
  
  const results = []
  
  // 测试每个配置档位
  for (let i = 0; i < speedConfigs.length; i++) {
    const speedConfig = speedConfigs[i]
    console.log(`\n📊 测试配置 ${i + 1}/${speedConfigs.length}: ${speedConfig.name}`)
    console.log(`🎯 目标速度: ${speedConfig.target}`)
    console.log('=' .repeat(60))
    
    // 测试文生图模式
    console.log('\n📸 测试文生图模式...')
    const beforeResult = await generateImageWithTiming(
      testScenario.beforePrompt, 
      speedConfig.config, 
      `test-before-${speedConfig.name}.webp`
    )
    
    results.push({
      ...beforeResult,
      mode: 'text-to-image',
      configName: speedConfig.name,
      target: speedConfig.target
    })
    
    // 如果before图生成成功，测试图生图模式
    if (beforeResult.success) {
      console.log('\n🔄 基于before图测试图生图模式...')
      await new Promise(resolve => setTimeout(resolve, 2000)) // 等待2秒
      
      const afterResult = await testImageToImageSpeed(
        beforeResult.imageUrl,
        speedConfig.config,
        testScenario.afterPrompt
      )
      
      results.push({
        ...afterResult,
        configName: speedConfig.name,
        target: speedConfig.target
      })
    }
    
    // 配置间等待3秒
    if (i < speedConfigs.length - 1) {
      console.log('\n⏳ 等待3秒后测试下一个配置...')
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
  }
  
  // 显示测试结果汇总
  console.log('\n' + '='.repeat(80))
  console.log('📊 速度测试结果汇总')
  console.log('=' .repeat(80))
  
  // 按模式分组显示结果
  const textToImageResults = results.filter(r => r.mode === 'text-to-image')
  const imageToImageResults = results.filter(r => r.mode === 'image-to-image')
  
  console.log('\n📸 文生图模式结果:')
  textToImageResults.forEach(result => {
    const status = result.success ? '✅' : '❌'
    const speed = result.success ? `${result.duration}秒` : '失败'
    console.log(`  ${status} ${result.configName}: ${speed} (目标: ${result.target})`)
  })
  
  console.log('\n🔄 图生图模式结果:')
  imageToImageResults.forEach(result => {
    const status = result.success ? '✅' : '❌'
    const speed = result.success ? `${result.duration}秒` : '失败'
    console.log(`  ${status} ${result.configName}: ${speed} (目标: ${result.target})`)
  })
  
  // 推荐配置
  const successfulResults = results.filter(r => r.success)
  if (successfulResults.length > 0) {
    const fastestText = textToImageResults.filter(r => r.success).sort((a, b) => a.duration - b.duration)[0]
    const fastestImage = imageToImageResults.filter(r => r.success).sort((a, b) => a.duration - b.duration)[0]
    
    console.log('\n🎯 推荐配置:')
    if (fastestText) {
      console.log(`  📸 文生图推荐: ${fastestText.configName} (${fastestText.duration}秒)`)
    }
    if (fastestImage) {
      console.log(`  🔄 图生图推荐: ${fastestImage.configName} (${fastestImage.duration}秒)`)
    }
    
    // 用户体验评估
    console.log('\n👤 用户体验评估:')
    const userAcceptable = successfulResults.filter(r => r.duration <= 30)
    const userIdeal = successfulResults.filter(r => r.duration <= 15)
    
    console.log(`  ✅ 可接受速度 (≤30秒): ${userAcceptable.length}个配置`)
    console.log(`  🚀 理想速度 (≤15秒): ${userIdeal.length}个配置`)
  }
  
  console.log('\n💡 建议:')
  console.log('  - 用户使用时采用最快的可接受配置')
  console.log('  - 展示图片可以使用高质量配置')
  console.log('  - 根据场景复杂度动态选择配置')
  
  return results
}

// 如果直接运行此脚本
if (require.main === module) {
  runSpeedTest().catch(console.error)
}

module.exports = { runSpeedTest, speedConfigs }