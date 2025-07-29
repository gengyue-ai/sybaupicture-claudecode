/**
 * 使用新的提示词方案生成场景
 * 重点：符合伦理的家庭结构 + Kontext简单指令
 */

const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')

// 新的提示词方案
const newScenarios = [
  {
    key: 'photography',
    name: '全家福人物移除',
    beforePrompt: 'Family portrait in bright modern kitchen: elderly grandfather and grandmother standing in center around wooden island, father mother and young boy standing beside them, all smiling at camera, natural window lighting, professional family photography',
    editInstruction: 'Remove the father, mother and young boy, keep only the elderly couple in center',
    description: '测试家庭结构正确性和人物移除一致性'
  },
  {
    key: 'ecommerce',
    name: '电商产品背景替换',
    beforePrompt: 'White athletic sneaker positioned at 45-degree angle on clean white surface, neutral gray background, professional product photography, centered composition',
    editInstruction: 'Change background to futuristic blue neon environment',
    description: '测试产品位置一致性'
  },
  {
    key: 'travel',
    name: '旅行景区路人移除',
    beforePrompt: 'Young couple embracing in center of European cobblestone town square, several tourists walking in background, historic colorful buildings, afternoon lighting',
    editInstruction: 'Remove all people in background, keep the square empty',
    description: '测试背景人物移除一致性'
  }
]

async function generateTextToImage(prompt, filename) {
  console.log(`📸 生成基础图片: ${filename}`)
  console.log(`📝 提示词: ${prompt}`)
  
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
      throw new Error(`API失败: ${response.status}`)
    }

    const data = await response.json()
    console.log(`✅ 基础图片生成成功: ${data.imageUrl}`)
    return data.imageUrl
    
  } catch (error) {
    console.error(`❌ 生成失败:`, error.message)
    return null
  }
}

async function editWithKontext(baseImageUrl, instruction, filename) {
  console.log(`✨ Kontext编辑: ${filename}`)
  console.log(`🎯 编辑指令: "${instruction}"`)
  
  try {
    const imageResponse = await fetch(baseImageUrl)
    const imageBuffer = await imageResponse.buffer()
    
    const FormData = require('form-data')
    const formData = new FormData()
    
    formData.append('mode', 'image-to-image')
    formData.append('file', imageBuffer, { filename: 'base.jpg' })
    formData.append('prompt', instruction)
    formData.append('style', 'professional')
    formData.append('width', '800')
    formData.append('height', '500')
    // 不设置intensity，让Kontext自动处理

    const response = await fetch('http://localhost:3003/api/generate', {
      method: 'POST',
      headers: {
        'x-admin-secret': 'showcase-2025-secret-key-dev-only'
      },
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Kontext编辑失败: ${response.status}`)
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
    console.log(`💾 保存: ${path.basename(filepath)}`)
    return true
  } catch (error) {
    console.error(`❌ 下载失败:`, error.message)
    return false
  }
}

async function generateNewScenarios() {
  console.log('🚀 使用新提示词方案生成场景图片')
  console.log('🎯 重点：正确家庭结构 + Kontext简单指令')
  console.log('📖 参考：Flux.1 Kontext [pro]官方文档')
  console.log('')
  
  const outputDir = path.join(__dirname, '../public/images/scenarios')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  const results = []
  
  for (let i = 0; i < newScenarios.length; i++) {
    const scenario = newScenarios[i]
    console.log(`\n🎬 场景 ${i + 1}/${newScenarios.length}: ${scenario.name}`)
    console.log(`📋 ${scenario.description}`)
    console.log('=' .repeat(80))
    
    try {
      // 第一步：生成基础图片
      console.log('\n📸 第一步：生成基础图片...')
      const beforeUrl = await generateTextToImage(scenario.beforePrompt, `${scenario.key}-new-before.webp`)
      
      if (!beforeUrl) {
        throw new Error('基础图片生成失败')
      }
      
      // 下载基础图片
      const beforePath = path.join(outputDir, `${scenario.key}-new-before.webp`)
      await downloadImage(beforeUrl, beforePath)
      
      // 等待3秒
      console.log('\n⏳ 等待3秒...')
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // 第二步：Kontext编辑
      console.log('\n✨ 第二步：Kontext简单指令编辑...')
      const afterUrl = await editWithKontext(beforeUrl, scenario.editInstruction, `${scenario.key}-new-after.webp`)
      
      if (!afterUrl) {
        throw new Error('Kontext编辑失败')
      }
      
      // 下载编辑后图片
      const afterPath = path.join(outputDir, `${scenario.key}-new-after.webp`)
      await downloadImage(afterUrl, afterPath)
      
      console.log(`\n🎉 ${scenario.name} 完成！`)
      console.log(`📁 Before: ${beforePath}`)
      console.log(`📁 After: ${afterPath}`)
      console.log(`🎯 编辑指令: "${scenario.editInstruction}"`)
      
      results.push({
        key: scenario.key,
        name: scenario.name,
        beforePath,
        afterPath,
        instruction: scenario.editInstruction,
        success: true
      })
      
      // 场景间等待5秒
      if (i < newScenarios.length - 1) {
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
  console.log('\n' + '='.repeat(80))
  console.log('🏁 新方案场景生成完成!')
  console.log('📊 生成结果汇总:')
  
  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)
  
  console.log(`✅ 成功: ${successful.length}/${results.length}`)
  successful.forEach(result => {
    console.log(`   ✓ ${result.name} - "${result.instruction}"`)
  })
  
  if (failed.length > 0) {
    console.log(`❌ 失败: ${failed.length}/${results.length}`)
    failed.forEach(result => {
      console.log(`   ✗ ${result.name}: ${result.error}`)
    })
  }
  
  console.log('\n🔍 请检查新生成的图片：')
  console.log('✓ 全家福：爷爷奶奶是否在中间？家庭结构是否合理？')
  console.log('✓ 电商：产品位置是否完全一致？')
  console.log('✓ 旅行：背景建筑是否保持一致？')
  console.log('\n📁 所有图片保存在: public/images/scenarios/')
  
  return results
}

if (require.main === module) {
  generateNewScenarios().catch(console.error)
}

module.exports = { generateNewScenarios, newScenarios }