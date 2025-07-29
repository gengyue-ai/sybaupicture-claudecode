/**
 * 完全按照fal.ai官方示例风格的测试
 * 参考：https://fal.ai/models/fal-ai/flux-pro/kontext/examples
 */

const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')

// 按官方示例风格设计的简洁提示词
const officialStylePrompts = [
  {
    key: 'family',
    name: '全家福测试',
    basePrompt: 'Family portrait: elderly couple in center, young family beside them, modern kitchen background',
    editPrompt: 'Remove the three younger people',  // 官方风格：5个词
    description: '测试人物移除 - 官方简洁风格'
  },
  {
    key: 'shoe',
    name: '产品测试', 
    basePrompt: 'White sneaker on white background, product photography',
    editPrompt: 'Change background to blue neon',  // 官方风格：5个词
    description: '测试背景替换 - 保持产品不变'
  },
  {
    key: 'square',
    name: '旅行测试',
    basePrompt: 'Couple embracing in town square, tourists in background',
    editPrompt: 'Remove all background people',  // 官方风格：4个词
    description: '测试背景人物移除'
  }
]

async function generateBase(prompt, filename) {
  console.log(`📸 生成基础图: ${filename}`)
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

    const data = await response.json()
    console.log(`✅ 基础图生成: ${data.imageUrl}`)
    return data.imageUrl
    
  } catch (error) {
    console.error(`❌ 失败:`, error.message)
    return null
  }
}

async function editOfficial(baseUrl, editPrompt, filename) {
  console.log(`✨ 官方风格编辑: ${filename}`)
  console.log(`🎯 "${editPrompt}"`)
  
  try {
    const imageResponse = await fetch(baseUrl)
    const imageBuffer = await imageResponse.buffer()
    
    const FormData = require('form-data')
    const formData = new FormData()
    
    formData.append('mode', 'image-to-image')
    formData.append('file', imageBuffer, { filename: 'base.jpg' })
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

    const data = await response.json()
    console.log(`✅ 编辑完成: ${data.imageUrl}`)
    return data.imageUrl
    
  } catch (error) {
    console.error(`❌ 编辑失败:`, error.message)
    return null
  }
}

async function download(url, filepath) {
  try {
    const response = await fetch(url)
    const buffer = await response.buffer()
    fs.writeFileSync(filepath, buffer)
    console.log(`💾 ${path.basename(filepath)}`)
    return true
  } catch (error) {
    console.error(`❌ 下载失败:`, error.message)
    return false
  }
}

async function testOfficialStyle() {
  console.log('🧪 官方风格测试')
  console.log('📖 参考：fal.ai/models/fal-ai/flux-pro/kontext/examples')
  console.log('🎯 策略：超简洁提示词（4-6个词）')
  console.log('⚙️ 参数：num_inference_steps=50, guidance_scale=3.5')
  console.log('')
  
  const outputDir = path.join(__dirname, '../public/images/scenarios')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  for (let i = 0; i < officialStylePrompts.length; i++) {
    const test = officialStylePrompts[i]
    console.log(`\n🎬 ${i + 1}/${officialStylePrompts.length}: ${test.name}`)
    console.log(`📋 ${test.description}`)
    console.log('-'.repeat(60))
    
    try {
      // 生成基础图
      const baseUrl = await generateBase(test.basePrompt, `${test.key}-official-before.webp`)
      if (!baseUrl) continue
      
      const beforePath = path.join(outputDir, `${test.key}-official-before.webp`)
      await download(baseUrl, beforePath)
      
      console.log('⏳ 等待3秒...')
      await new Promise(r => setTimeout(r, 3000))
      
      // 官方风格编辑
      const afterUrl = await editOfficial(baseUrl, test.editPrompt, `${test.key}-official-after.webp`)
      if (!afterUrl) continue
      
      const afterPath = path.join(outputDir, `${test.key}-official-after.webp`)
      await download(afterUrl, afterPath)
      
      console.log(`🎉 ${test.name} 完成`)
      console.log(`📁 Before: ${beforePath}`)
      console.log(`📁 After: ${afterPath}`)
      console.log(`🎯 编辑: "${test.editPrompt}"`)
      
      if (i < officialStylePrompts.length - 1) {
        console.log('\n⏳ 等待5秒...')
        await new Promise(r => setTimeout(r, 5000))
      }
      
    } catch (error) {
      console.error(`❌ ${test.name} 失败:`, error.message)
    }
  }
  
  console.log('\n🏁 官方风格测试完成!')
  console.log('🔍 检查要点：')
  console.log('✓ 全家福：是否正确移除了3个年轻人？')
  console.log('✓ 产品：鞋子颜色/形状是否保持一致？')
  console.log('✓ 旅行：建筑和情侣是否保持不变？')
}

if (require.main === module) {
  testOfficialStyle().catch(console.error)
}

module.exports = { testOfficialStyle }