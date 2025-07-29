/**
 * 生成剩余三组场景
 * 使用成功的Kontext配置 + 参考5.png的品质标准
 */

const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')

// 剩余三个场景的优化配置
const remainingScenarios = [
  {
    key: 'travel',
    name: '旅行景区路人移除',
    basePrompt: 'Romantic couple embracing in center of beautiful European cobblestone town square, several tourists and people walking around in background, historic colorful buildings, afternoon golden light, professional photography',
    editPrompt: 'Remove all background people',
    description: '保留情侣，移除所有背景游客'
  },
  {
    key: 'fashion',
    name: '时尚人物背景替换',
    basePrompt: 'Stylish young woman wearing black leather jacket and sunglasses, sitting confidently in busy urban cafe with many people and activity in background, natural window lighting, fashion portrait photography',
    editPrompt: 'Change background to clean studio backdrop',
    description: '保持人物一致，简化为工作室背景'
  },
  {
    key: 'realestate',
    name: '房地产室内整理',
    basePrompt: 'Modern elegant dining room interior with large wooden table covered in scattered items: books, papers, coffee cups, magazines, laptop, keys creating cluttered appearance, natural daylight from large windows, interior design photography',
    editPrompt: 'Remove all items from table surface',
    description: '清理所有桌面杂物，保持房间不变'
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

async function generateRemainingThree() {
  console.log('🚀 生成剩余三组场景')
  console.log('⚙️ 使用验证成功的Kontext配置')
  console.log('🎯 参考电商场景的成功经验')
  console.log('')
  
  const outputDir = path.join(__dirname, '../public/images/scenarios')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  const results = []
  
  for (let i = 0; i < remainingScenarios.length; i++) {
    const scenario = remainingScenarios[i]
    console.log(`\n🎬 场景 ${i + 1}/${remainingScenarios.length}: ${scenario.name}`)
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
      if (i < remainingScenarios.length - 1) {
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
  console.log('🏁 剩余三组场景生成完成!')
  
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
  
  console.log('\n🔍 完成后请检查:')
  console.log('✓ 旅行：情侣位置是否一致？背景建筑是否保持不变？')
  console.log('✓ 时尚：人物服装和姿势是否完全一致？')
  console.log('✓ 房地产：房间和桌子是否保持不变，只清理杂物？')
  
  console.log('\n📁 所有图片已保存到: public/images/scenarios/')
  console.log('🎭 可以更新UnifiedScenarioShowcase组件使用所有场景!')
  
  return results
}

if (require.main === module) {
  generateRemainingThree().catch(console.error)
}

module.exports = { generateRemainingThree }