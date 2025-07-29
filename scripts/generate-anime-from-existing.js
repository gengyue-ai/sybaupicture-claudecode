/**
 * 使用现有原图生成真实动漫化效果
 * 基于 style-before.webp 通过我们的API生成 style-after.webp
 */

const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')
const FormData = require('form-data')

// 配置
const INPUT_IMAGE = path.join(__dirname, '..', 'public', 'images', 'examples', 'style-before.webp')
const OUTPUT_IMAGE = path.join(__dirname, '..', 'public', 'images', 'examples', 'style-after.webp')
const API_BASE = 'http://localhost:3003' // 使用本地开发环境
const ADMIN_SECRET = 'showcase-2025-secret-key-dev-only'

// 基于官方Flux Pro Kontext格式的动漫化提示词
const ANIME_PROMPT = 'Transform to anime art style while preserving all facial features, pose, and identity exactly. Use clean line art, soft cel shading, and vibrant colors typical of Japanese anime, with stylized anime eyes and hair details but maintaining the same person identity'

// 检查输入文件是否存在
function checkInputFile() {
  if (!fs.existsSync(INPUT_IMAGE)) {
    throw new Error(`输入图片不存在: ${INPUT_IMAGE}`)
  }
  console.log(`✅ 找到输入图片: ${INPUT_IMAGE}`)
}

// 生成动漫化效果
async function generateAnimeStyle() {
  console.log('🎨 开始生成动漫化效果...')
  console.log(`📝 提示词: ${ANIME_PROMPT}`)
  
  try {
    // 读取输入图片
    const imageBuffer = fs.readFileSync(INPUT_IMAGE)
    console.log(`📷 图片大小: ${Math.round(imageBuffer.length / 1024)}KB`)
    
    // 创建FormData
    const formData = new FormData()
    formData.append('mode', 'image-to-image')
    formData.append('file', imageBuffer, { 
      filename: 'style-before.webp',
      contentType: 'image/webp'
    })
    formData.append('prompt', ANIME_PROMPT)
    formData.append('style', 'creative') // 创意风格适合动漫转换
    formData.append('intensity', '3') // 中等强度保持身份
    formData.append('width', '800')
    formData.append('height', '500')

    console.log('🚀 发送API请求...')
    const response = await fetch(`${API_BASE}/api/generate`, {
      method: 'POST',
      headers: {
        'x-admin-secret': ADMIN_SECRET
      },
      body: formData
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API请求失败: ${response.status} ${response.statusText}\n${errorText}`)
    }

    const result = await response.json()
    
    if (!result.success || !result.imageUrl) {
      throw new Error(`API返回错误: ${result.error || '未知错误'}`)
    }

    console.log(`✅ 动漫化生成成功: ${result.imageUrl}`)
    return result.imageUrl
    
  } catch (error) {
    console.error('❌ 生成动漫化效果失败:', error.message)
    throw error
  }
}

// 下载并保存结果图片
async function downloadAndSave(imageUrl) {
  try {
    console.log('💾 下载生成的图片...')
    
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`下载失败: ${response.status}`)
    }
    
    const buffer = await response.buffer()
    
    // 备份原来的文件
    if (fs.existsSync(OUTPUT_IMAGE)) {
      const backupPath = OUTPUT_IMAGE.replace('.webp', '.backup.webp')
      fs.copyFileSync(OUTPUT_IMAGE, backupPath)
      console.log(`📦 原文件已备份: ${backupPath}`)
    }
    
    // 保存新文件
    fs.writeFileSync(OUTPUT_IMAGE, buffer)
    console.log(`✅ 动漫化图片保存成功: ${OUTPUT_IMAGE}`)
    console.log(`📏 文件大小: ${Math.round(buffer.length / 1024)}KB`)
    
    return OUTPUT_IMAGE
  } catch (error) {
    console.error('❌ 图片下载保存失败:', error.message)
    throw error
  }
}

// 主执行函数
async function main() {
  console.log('🎬 开始使用现有原图生成真实动漫化效果...')
  console.log('=' .repeat(60))
  
  try {
    // 1. 检查输入文件
    checkInputFile()
    
    // 2. 生成动漫化效果
    const imageUrl = await generateAnimeStyle()
    
    // 3. 下载并保存结果
    await downloadAndSave(imageUrl)
    
    console.log('=' .repeat(60))
    console.log('🎉 动漫化效果生成完成！')
    console.log(`📍 输入图片: ${INPUT_IMAGE}`)
    console.log(`📍 输出图片: ${OUTPUT_IMAGE}`)
    console.log('')
    console.log('✨ 现在可以检查新生成的 style-after.webp 效果了！')
    console.log('💡 如果效果满意，可以直接部署到生产环境')
    
  } catch (error) {
    console.error('\n❌ 执行失败:', error.message)
    console.log('\n🔧 请检查:')
    console.log('1. 是否启动了本地开发服务器 (npm run dev)')
    console.log('2. 输入图片是否存在')
    console.log('3. 网络连接是否正常')
    process.exit(1)
  }
}

// 运行脚本
if (require.main === module) {
  main()
}

module.exports = { main }