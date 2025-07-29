/**
 * 风格转换功能专用图片生成脚本
 * 基于Flux Pro Kontext官方最佳实践
 * 确保人脸位置和身份特征完全保持一致
 */

const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')

// 风格转换专用配置 - 基于官方成功案例
const styleConversionConfig = {
  key: 'style-conversion',
  name: '风格转换 - 真人转动漫（保持身份）',
  // Before图：生成标准真人肖像
  beforePrompt: 'Professional headshot portrait of young Asian woman with shoulder-length straight dark hair, wearing casual white t-shirt, gentle smile, looking directly at camera, soft natural lighting from window, centered composition, high quality photography, realistic skin texture, 800x500 aspect ratio',
  // After图：基于官方格式的风格转换提示词
  afterPrompt: 'Transform to anime art style while preserving all facial features, pose, and identity exactly. Keep the same face shape, eye position, hair style, and expression. Use clean line art, soft cel shading, and vibrant colors typical of Japanese anime, with stylized anime eyes and hair details but maintaining the same person identity',
  intensity: 3, // 中等强度确保风格转换但保持身份
  useOptimalParams: true // 使用Flux Pro Kontext最佳参数
}

// API配置 - 使用生产环境
const API_BASE = 'https://sybaupicture.com'
const ADMIN_SECRET = 'showcase-2025-secret-key-dev-only'
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images', 'examples')

// 确保输出目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

// 生成文生图（第一步）- 标准真人肖像
async function generateBeforeImage(prompt, filename) {
  console.log(`🎨 生成Before图片: ${filename}`)
  console.log(`📝 提示词: ${prompt.substring(0, 80)}...`)
  
  try {
    const response = await fetch(`${API_BASE}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': ADMIN_SECRET
      },
      body: JSON.stringify({
        prompt: prompt,
        mode: 'text-to-image',
        taskType: 'generate',
        style: 'professional',
        intensity: 3
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

// 生成图生图（第二步）- 风格转换（保持身份）
async function generateStyleConversion(baseImageUrl, prompt, intensity, filename) {
  console.log(`🎭 执行风格转换: ${filename}`)
  console.log(`📝 转换提示: ${prompt.substring(0, 80)}...`)
  console.log(`🎚️ 强度设置: ${intensity} (保持身份一致性)`)
  
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
    formData.append('style', 'creative') // 创意风格适合动漫转换
    formData.append('intensity', intensity.toString())
    formData.append('width', '800')
    formData.append('height', '500')

    const response = await fetch(`${API_BASE}/api/generate`, {
      method: 'POST',
      headers: {
        'x-admin-secret': ADMIN_SECRET
      },
      body: formData
    })

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.imageUrl) {
      throw new Error('API返回数据中没有imageUrl')
    }

    console.log(`✅ 风格转换成功: ${data.imageUrl}`)
    return data.imageUrl
    
  } catch (error) {
    console.error(`❌ 风格转换失败 ${filename}:`, error.message)
    return null
  }
}

// 下载并保存图片
async function downloadAndSaveImage(imageUrl, filename) {
  try {
    console.log(`💾 下载图片: ${filename}`)
    
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`下载失败: ${response.status}`)
    }
    
    const buffer = await response.buffer()
    const filePath = path.join(OUTPUT_DIR, filename)
    
    fs.writeFileSync(filePath, buffer)
    console.log(`✅ 图片保存成功: ${filePath}`)
    
    return filePath
  } catch (error) {
    console.error(`❌ 图片下载失败 ${filename}:`, error.message)
    return null
  }
}

// 主执行函数
async function generateStyleConversionExample() {
  console.log('🎬 开始生成风格转换示例图片...')
  console.log('📋 配置信息:', {
    场景: styleConversionConfig.name,
    强度: styleConversionConfig.intensity,
    最佳参数: styleConversionConfig.useOptimalParams
  })
  
  try {
    // 第一步：生成Before图（标准真人肖像）
    console.log('\n🎯 第一步：生成标准真人肖像...')
    const beforeImageUrl = await generateBeforeImage(
      styleConversionConfig.beforePrompt,
      'style-before.webp'
    )
    
    if (!beforeImageUrl) {
      throw new Error('Before图片生成失败')
    }
    
    // 保存Before图片
    await downloadAndSaveImage(beforeImageUrl, 'style-before.webp')
    
    // 等待3秒确保API不被限流
    console.log('⏳ 等待3秒后执行风格转换...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // 第二步：基于Before图执行风格转换
    console.log('\n🎭 第二步：执行风格转换（保持身份）...')
    const afterImageUrl = await generateStyleConversion(
      beforeImageUrl,
      styleConversionConfig.afterPrompt,
      styleConversionConfig.intensity,
      'style-after.webp'
    )
    
    if (!afterImageUrl) {
      throw new Error('风格转换失败')
    }
    
    // 保存After图片
    await downloadAndSaveImage(afterImageUrl, 'style-after.webp')
    
    console.log('\n🎉 风格转换示例生成完成！')
    console.log('📁 输出目录:', OUTPUT_DIR)
    console.log('📷 Before图片: style-before.webp')
    console.log('🎨 After图片: style-after.webp')
    console.log('\n✨ 现在可以检查生成的图片是否保持了人物身份特征！')
    
  } catch (error) {
    console.error('❌ 风格转换示例生成失败:', error.message)
    process.exit(1)
  }
}

// 运行脚本
if (require.main === module) {
  generateStyleConversionExample()
}

module.exports = { generateStyleConversionExample }