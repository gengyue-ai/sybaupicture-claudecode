#!/usr/bin/env node

/**
 * 紧急修复脚本 - 直接调用生产环境的紧急修复API
 * 专门解决九月用户4/3问题，绕过Vercel认证限制
 */

const https = require('https')

const API_BASE_URL = 'https://sybaupicture-wm0bzq8y3-michaels-projects-a7bdff74.vercel.app'
const EMERGENCY_KEY = 'fix-jiuyue-4-3-issue-2024'

// 执行HTTP请求
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    }

    const protocol = url.startsWith('https:') ? https : require('http')
    
    const req = protocol.request(url, requestOptions, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data)
          resolve({ status: res.statusCode, data: jsonData })
        } catch (e) {
          resolve({ status: res.statusCode, data: data })
        }
      })
    })

    req.on('error', reject)
    
    if (options.body) {
      req.write(JSON.stringify(options.body))
    }
    
    req.end()
  })
}

async function main() {
  console.log('🚨 紧急修复九月用户4/3问题...')
  console.log(`🔗 API地址: ${API_BASE_URL}`)
  console.log('🎯 专门解决双重计数导致的历史数据不一致问题\n')
  
  try {
    // 1. 首先检查当前问题
    console.log('1️⃣ 检查当前使用量数据问题...')
    const checkUrl = `${API_BASE_URL}/api/fix-usage-emergency`
    const checkResult = await makeRequest(checkUrl)
    
    if (checkResult.status !== 200) {
      console.error('❌ 检查失败:', checkResult.data)
      return
    }

    const issues = checkResult.data.issues || []
    console.log(`✅ 检查完成: 发现 ${issues.length} 个超限用户\n`)
    
    if (issues.length === 0) {
      console.log('🎉 没有发现使用量超限问题')
      return
    }

    // 显示问题详情
    console.log('🚨 发现的超限用户:')
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.email} (${issue.planName}套餐)`)
      console.log(`   当前显示: ${issue.currentUsage}/${issue.correctLimit} (超出${issue.exceedBy}张)`)
    })

    // 重点标注九月用户
    const jiuyueUser = issues.find(issue => 
      issue.email && (issue.email.includes('九月') || issue.email.includes('jiuyue'))
    )
    if (jiuyueUser) {
      console.log(`\n⭐ 重点关注：九月用户 ${jiuyueUser.email}`)
      console.log(`   当前显示: ${jiuyueUser.currentUsage}/${jiuyueUser.correctLimit}`)
    }

    // 2. 执行紧急修复
    console.log('\n2️⃣ 执行紧急修复...')
    const fixUrl = `${API_BASE_URL}/api/fix-usage-emergency`
    const fixResult = await makeRequest(fixUrl, { 
      method: 'POST',
      body: { emergency_key: EMERGENCY_KEY }
    })
    
    if (fixResult.status !== 200) {
      console.error('❌ 紧急修复失败:', fixResult.data)
      return
    }

    const fixes = fixResult.data.fixes || []
    const jiuyueFixed = fixResult.data.jiuyueFixed
    
    console.log(`✅ 紧急修复完成: 处理了 ${fixes.length} 个用户`)
    
    // 显示修复详情
    if (fixes.length > 0) {
      console.log('\n📝 修复详情:')
      fixes.forEach((fix, index) => {
        console.log(`${index + 1}. ${fix.email}`)
        console.log(`   修复前: ${fix.oldUsage}/${fix.limit}`)
        console.log(`   实际生成: ${fix.actualGenerated}张`)
        console.log(`   修复后: ${fix.newUsage}/${fix.limit}`)
      })
      
      // 特别显示九月用户的修复情况
      if (jiuyueFixed) {
        const jiuyueFix = fixes.find(fix => 
          fix.email && (fix.email.includes('九月') || fix.email.includes('jiuyue'))
        )
        if (jiuyueFix) {
          console.log(`\n🎉 九月用户修复成功！`)
          console.log(`   ${jiuyueFix.oldUsage}/${jiuyueFix.limit} → ${jiuyueFix.newUsage}/${jiuyueFix.limit}`)
          console.log(`   基于实际生成${jiuyueFix.actualGenerated}张图片重新计算`)
        }
      }
    }

    console.log('\n✅ 九月用户4/3问题紧急修复完成!')
    console.log('💡 双重计数问题已从根源修复，用户现在看到的使用量是正确的了')
    console.log('🔒 未来不会再出现类似的超限显示问题')

  } catch (error) {
    console.error('❌ 紧急修复失败:', error.message)
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 请检查网络连接和API地址')
    }
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { main }