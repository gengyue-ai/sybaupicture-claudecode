/**
 * 重新生成电商场景，参考5.png的成功效果
 * 目标：有品牌特色的运动鞋 + 戏剧性背景变化
 */

const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')

async function generateEcommerceBase() {
  console.log('📸 生成电商基础图片...')
  // 参考5.png：有品牌特色的运动鞋，工业/街头环境
  const prompt = 'Professional product photography: colorful athletic sneaker with brand logo, positioned at 45-degree angle on dark concrete surface, industrial urban background, dramatic lighting, high-end product shot'
  console.log(`📝 ${prompt}`)
  
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
      throw new Error(`基础图片生成失败: ${response.status}`)
    }

    const data = await response.json()
    console.log(`✅ 基础图片生成成功: ${data.imageUrl}`)
    return data.imageUrl
    
  } catch (error) {
    console.error(`❌ 生成失败:`, error.message)
    return null
  }
}

async function editEcommerce(baseUrl) {
  console.log('✨ Kontext编辑电商背景...')
  // 参考5.png：变成红色霓虹科幻环境
  const editPrompt = 'Change background to futuristic red neon environment'
  console.log(`🎯 编辑指令: "${editPrompt}"`)
  
  try {
    const imageResponse = await fetch(baseUrl)
    const imageBuffer = await imageResponse.buffer()
    console.log(`📏 基础图片大小: ${imageBuffer.length} bytes`)
    
    const FormData = require('form-data')
    const formData = new FormData()
    
    formData.append('mode', 'image-to-image')
    formData.append('file', imageBuffer, { filename: 'ecommerce.jpg' })
    formData.append('prompt', editPrompt)
    formData.append('style', 'professional')
    formData.append('width', '800')
    formData.append('height', '500')

    const response = await fetch('http://localhost:3003/api/generate', {
      method: 'POST',
      headers: {
        'x-admin-secret': 'showcase-2025-secret-key-dev-only'
      },
      body: formData
    })

    console.log(`📊 Kontext响应状态: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Kontext编辑失败: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log(`✅ Kontext编辑成功: ${data.imageUrl}`)
    return data.imageUrl
    
  } catch (error) {
    console.error(`❌ Kontext编辑失败:`, error.message)
    return null
  }
}

async function downloadImage(url, filepath) {
  try {
    const response = await fetch(url)
    const buffer = await response.buffer()
    fs.writeFileSync(filepath, buffer)
    console.log(`💾 保存: ${path.basename(filepath)} (${buffer.length} bytes)`)
    return buffer.length > 1000
  } catch (error) {
    console.error(`❌ 下载失败:`, error.message)
    return false
  }
}

async function generateImprovedEcommerce() {
  console.log('🛍️ 生成改进版电商场景')
  console.log('🎯 参考5.png的成功效果')
  console.log('💡 目标：品牌运动鞋 + 戏剧性背景变化')
  console.log('')
  
  const outputDir = path.join(__dirname, '../public/images/scenarios')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  try {
    // 第一步：生成有特色的运动鞋基础图
    console.log('📸 第一步：生成品牌运动鞋基础图...')
    const beforeUrl = await generateEcommerceBase()
    
    if (!beforeUrl) {
      throw new Error('基础图生成失败')
    }
    
    // 下载基础图片
    const beforePath = path.join(outputDir, 'ecommerce-improved-before.webp')
    const beforeSaved = await downloadImage(beforeUrl, beforePath)
    
    if (!beforeSaved) {
      throw new Error('基础图片下载失败或文件损坏')
    }
    
    console.log('⏳ 等待3秒...')
    await new Promise(r => setTimeout(r, 3000))
    
    // 第二步：Kontext编辑背景为红色霓虹
    console.log('\n✨ 第二步：Kontext变换为红色霓虹背景...')
    const afterUrl = await editEcommerce(beforeUrl)
    
    if (!afterUrl) {
      throw new Error('Kontext编辑失败')
    }
    
    // 下载编辑后图片
    const afterPath = path.join(outputDir, 'ecommerce-improved-after.webp')
    const afterSaved = await downloadImage(afterUrl, afterPath)
    
    if (!afterSaved) {
      throw new Error('编辑图片下载失败或文件损坏')
    }
    
    console.log('\n🎉 改进版电商场景完成！')
    console.log('📁 文件位置:')
    console.log(`   Before: ${beforePath}`)
    console.log(`   After: ${afterPath}`)
    console.log('\n🔍 检查要点：')
    console.log('✓ Before图：运动鞋是否有品牌特色和配色？')
    console.log('✓ After图：背景是否变成红色霓虹科幻环境？')
    console.log('✓ 产品：鞋子的颜色、角度、品牌标识是否完全一致？')
    console.log('✓ 对比5.png：效果是否达到相似的专业水准？')
    
    return true
    
  } catch (error) {
    console.error(`❌ 改进版电商场景失败:`, error.message)
    return false
  }
}

if (require.main === module) {
  generateImprovedEcommerce().catch(console.error)
}

module.exports = { generateImprovedEcommerce }