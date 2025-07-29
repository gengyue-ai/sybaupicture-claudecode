/**
 * 生成所有5个场景的最终版本
 * 使用已验证的Kontext配置 + 官方简洁提示词
 */

const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')

// 5个场景的最终配置
const finalScenarios = [
  {
    key: 'photography',
    name: '全家福人物移除',
    basePrompt: 'Family portrait in modern kitchen: elderly grandmother and father mother young boy around wooden island, warm natural lighting, professional photography',
    editPrompt: 'Remove the three younger people',
    description: '保留奶奶，移除年轻人'
  },
  {
    key: 'ecommerce',
    name: '电商产品背景替换',
    basePrompt: 'White athletic sneaker on clean white surface, neutral background, professional product photography',
    editPrompt: 'Change background to blue neon lighting',
    description: '保持产品一致，只改背景'
  },
  {
    key: 'travel',
    name: '旅行景区路人移除',
    basePrompt: 'Romantic couple embracing in European town square, tourists walking in background, historic buildings',
    editPrompt: 'Remove all background people',
    description: '保留情侣，移除背景人物'
  },
  {
    key: 'fashion',
    name: '时尚人物背景替换',
    basePrompt: 'Young woman wearing black leather jacket, sitting in busy cafe, natural lighting',
    editPrompt: 'Change background to simple studio backdrop',
    description: '保持人物一致，简化背景'
  },
  {
    key: 'realestate',
    name: '房地产室内整理',
    basePrompt: 'Modern dining room with wooden table covered in scattered books papers cups, natural lighting',
    editPrompt: 'Remove all items from table',
    description: '清理桌面杂物'
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

async function editWithKontext(baseUrl, editPrompt, filename) {
  console.log(`✨ Kontext编辑: ${filename}`)
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
    console.log(`✅ Kontext编辑成功: ${data.imageUrl}`)
    return data.imageUrl
    
  } catch (error) {
    console.error(`❌ Kontext编辑失败:`, error.message)
    return null
  }
}

async function download(url, filepath) {
  try {
    const response = await fetch(url)
    const buffer = await response.buffer()
    fs.writeFileSync(filepath, buffer)
    console.log(`💾 ${path.basename(filepath)} (${buffer.length} bytes)`)
    return buffer.length > 1000
  } catch (error) {
    console.error(`❌ 下载失败:`, error.message)
    return false
  }
}

async function generateAllScenarios() {
  console.log('🚀 生成所有5个场景的最终版本')
  console.log('⚙️ 使用已验证的Kontext配置')
  console.log('📖 官方简洁提示词风格')
  console.log('')
  
  const outputDir = path.join(__dirname, '../public/images/scenarios')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  const results = []
  
  for (let i = 0; i < finalScenarios.length; i++) {
    const scenario = finalScenarios[i]
    console.log(`\n🎬 场景 ${i + 1}/${finalScenarios.length}: ${scenario.name}`)
    console.log(`📋 ${scenario.description}`)
    console.log('-'.repeat(60))
    
    try {
      // 生成基础图
      const baseUrl = await generateBase(scenario.basePrompt, `${scenario.key}-final-before.webp`)
      if (!baseUrl) {
        throw new Error('基础图生成失败')
      }
      
      const beforePath = path.join(outputDir, `${scenario.key}-before.webp`)
      const beforeSaved = await download(baseUrl, beforePath)
      if (!beforeSaved) {
        throw new Error('基础图保存失败')
      }
      
      console.log('⏳ 等待3秒...')
      await new Promise(r => setTimeout(r, 3000))
      
      // Kontext编辑
      const afterUrl = await editWithKontext(baseUrl, scenario.editPrompt, `${scenario.key}-final-after.webp`)
      if (!afterUrl) {
        throw new Error('Kontext编辑失败')
      }
      
      const afterPath = path.join(outputDir, `${scenario.key}-after.webp`)
      const afterSaved = await download(afterUrl, afterPath)
      if (!afterSaved) {
        throw new Error('编辑图保存失败')
      }
      
      console.log(`🎉 ${scenario.name} 完成`)
      console.log(`📁 Before: ${beforePath}`)
      console.log(`📁 After: ${afterPath}`)
      
      results.push({
        key: scenario.key,
        name: scenario.name,
        success: true,
        beforePath,
        afterPath
      })
      
      // 场景间等待
      if (i < finalScenarios.length - 1) {
        console.log('\n⏳ 等待5秒后继续...')
        await new Promise(r => setTimeout(r, 5000))
      }
      
    } catch (error) {
      console.error(`❌ ${scenario.name} 失败:`, error.message)
      results.push({
        key: scenario.key,
        name: scenario.name,
        success: false,
        error: error.message
      })
    }
  }
  
  // 结果汇总
  console.log('\n' + '='.repeat(60))
  console.log('🏁 所有场景生成完成!')
  
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
  
  console.log('\n📁 所有图片已保存到: public/images/scenarios/')
  console.log('🎭 可以更新UnifiedScenarioShowcase组件使用这些图片!')
  
  return results
}

if (require.main === module) {
  generateAllScenarios().catch(console.error)
}

module.exports = { generateAllScenarios }