/**
 * 生成画廊去水印案例图片脚本
 * 使用API生成匹配的前后对比图，测试模版功能
 */

const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')

async function generateWatermarkGalleryImages() {
  console.log('🎯 开始生成画廊去水印案例图片...')
  console.log('💡 使用现有商务照片，节省token')
  
  try {
    // 1. 先生成一张无水印的干净商务照片
    console.log('📷 生成干净的商务照片作为基础...')
    
    const cleanBusinessResponse = await fetch('http://localhost:3003/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': 'showcase-2025-secret-key-dev-only'
      },
      body: JSON.stringify({
        mode: 'text-to-image',
        prompt: 'professional business portrait of young Asian woman, white shirt, office background, clean photo without any watermarks or text',
        style: 'professional',
        intensity: 4,
        width: 800,
        height: 500
      })
    })

    if (!cleanBusinessResponse.ok) {
      throw new Error(`生成基础照片失败: ${cleanBusinessResponse.status}`)
    }

    const cleanBusinessData = await cleanBusinessResponse.json()
    if (!cleanBusinessData.success) {
      throw new Error(`生成基础照片失败: ${cleanBusinessData.error}`)
    }

    console.log('✅ 干净商务照片生成成功:', cleanBusinessData.imageUrl)

    // 下载干净的商务照片
    const cleanImageResponse = await fetch(cleanBusinessData.imageUrl)
    const existingImageBuffer = await cleanImageResponse.buffer()
    console.log('✅ 干净商务照片下载成功，大小:', existingImageBuffer.length, 'bytes')

    // 2. 给现有照片添加水印（图生图）
    console.log('🖊️ 给商务照片添加水印...')
    
    const FormData = require('form-data')
    const addWatermarkFormData = new FormData()
    
    addWatermarkFormData.append('mode', 'image-to-image')
    addWatermarkFormData.append('file', existingImageBuffer, { filename: 'business-photo.webp' })
    addWatermarkFormData.append('prompt', 'add large "SYBAU" watermark in center')
    addWatermarkFormData.append('style', 'professional')
    addWatermarkFormData.append('intensity', '3')
    addWatermarkFormData.append('width', '800')
    addWatermarkFormData.append('height', '500')
    
    const addWatermarkResponse = await fetch('http://localhost:3003/api/generate', {
      method: 'POST',
      headers: {
        'x-admin-secret': 'showcase-2025-secret-key-dev-only'
      },
      body: addWatermarkFormData
    })

    if (!addWatermarkResponse.ok) {
      const errorText = await addWatermarkResponse.text()
      console.error('❌ API错误详情:', errorText)
      throw new Error(`添加水印失败: ${addWatermarkResponse.status} / ${errorText}`)
    }

    const watermarkedData = await addWatermarkResponse.json()
    if (!watermarkedData.success) {
      throw new Error(`添加水印失败: ${watermarkedData.error}`)
    }

    console.log('✅ 水印添加成功:', watermarkedData.imageUrl)

    // 3. 下载带水印的图片并保存为before图片
    console.log('💾 保存带水印的图片为before图片...')
    const watermarkedImageResponse = await fetch(watermarkedData.imageUrl)
    const watermarkedImageBuffer = await watermarkedImageResponse.buffer()
    
    const beforeImagePath = path.join(process.cwd(), 'public/images/examples/watermark-before.webp')
    fs.writeFileSync(beforeImagePath, watermarkedImageBuffer)
    console.log('✅ 带水印图片已保存:', beforeImagePath)

    // 等待2秒，让添加水印完成
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 4. 使用带水印的图片进行去水印处理
    console.log('🎨 使用真实的去水印模版功能去除水印...')
    
    // 使用刚才生成的带水印图片
    console.log('📥 使用带水印的图片作为输入...')
    const watermarkedImageForRemoval = watermarkedImageBuffer
    
    // 使用FormData模拟用户上传图片进行去水印
    const removeWatermarkFormData = new FormData()
    
    removeWatermarkFormData.append('mode', 'image-to-image')
    removeWatermarkFormData.append('file', watermarkedImageForRemoval, { filename: 'watermarked-input.jpg' })
    removeWatermarkFormData.append('prompt', 'remove all watermarks and text overlays, completely clean image')
    removeWatermarkFormData.append('style', 'professional')
    removeWatermarkFormData.append('intensity', '4')
    removeWatermarkFormData.append('width', '800')
    removeWatermarkFormData.append('height', '500')
    
    const processedImageResponse = await fetch('http://localhost:3003/api/generate', {
      method: 'POST',
      headers: {
        'x-admin-secret': 'showcase-2025-secret-key-dev-only'
      },
      body: removeWatermarkFormData
    })

    if (!processedImageResponse.ok) {
      throw new Error(`生成处理图失败: ${processedImageResponse.status}`)
    }

    const processedData = await processedImageResponse.json()
    if (!processedData.success) {
      throw new Error(`生成处理图失败: ${processedData.error}`)
    }

    console.log('✅ 处理图生成成功:', processedData.imageUrl)

    // 5. 下载并保存处理后的图片作为 watermark-after.webp
    console.log('💾 下载并保存处理后的图片...')
    const processedImageResponse2 = await fetch(processedData.imageUrl)
    const processedImageBuffer = await processedImageResponse2.buffer()
    
    const afterImagePath = path.join(process.cwd(), 'public/images/examples/watermark-after.webp')
    fs.writeFileSync(afterImagePath, processedImageBuffer)
    console.log('✅ 处理图已保存:', afterImagePath)

    console.log('🎉 画廊去水印案例图片生成完成！')
    console.log('📸 前图 (带水印):', 'watermark-before.webp')
    console.log('📸 后图 (去水印):', 'watermark-after.webp')
    console.log('🔗 带水印URL:', watermarkedData.imageUrl)
    console.log('🔗 去水印URL:', processedData.imageUrl)

  } catch (error) {
    console.error('❌ 生成失败:', error.message)
    process.exit(1)
  }
}

// 检查环境
console.log('🔍 检查环境变量...')
if (!process.env.FAL_KEY) {
  console.log('⚠️ FAL_KEY 环境变量未设置，尝试从 .env 文件加载...')
  try {
    require('dotenv').config()
    if (!process.env.FAL_KEY) {
      console.error('❌ FAL_KEY 环境变量仍未设置，请确保在 .env 文件中配置了 FAL_KEY')
      console.log('💡 提示: 请先运行 "npm run env:status" 检查环境配置')
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ 无法加载 dotenv:', error.message)
    process.exit(1)
  }
}

console.log('✅ 环境变量检查通过')

// 确保必要目录存在
const examplesDir = path.join(process.cwd(), 'public/images/examples')
if (!fs.existsSync(examplesDir)) {
  fs.mkdirSync(examplesDir, { recursive: true })
  console.log('📁 创建目录:', examplesDir)
}

// 运行脚本
generateWatermarkGalleryImages()