#!/usr/bin/env node

/**
 * Sybau Picture 健康检查脚本
 * 创建时间: 2025-07-31
 * 
 * 功能:
 * - 检查应用基本健康状态
 * - 验证关键API端点
 * - 测试数据库连接
 * - 验证关键用户功能
 * - 检查第三方服务集成
 */

const https = require('https')
const http = require('http')

// 配置
const CONFIG = {
  baseUrl: process.env.NEXTAUTH_URL || 'https://sybaupicture.com',
  timeout: 10000, // 10秒超时
  keyUsers: ['40863666@qq.com'],
  criticalEndpoints: [
    '/api/health',
    '/api/auth/session',
    '/api/subscription',
    '/api/user/usage',
    '/api/payment/create-checkout-session'
  ],
  retryAttempts: 3,
  retryDelay: 2000 // 2秒重试间隔
}

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function error(message) {
  log(`❌ ${message}`, 'red')
}

function success(message) {
  log(`✅ ${message}`, 'green')
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue')
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow')
}

// HTTP请求工具
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http
    
    const requestOptions = {
      timeout: CONFIG.timeout,
      headers: {
        'User-Agent': 'Sybau-Health-Check/1.0',
        'Accept': 'application/json',
        ...options.headers
      },
      ...options
    }
    
    const req = protocol.get(url, requestOptions, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        try {
          const result = {
            statusCode: res.statusCode,
            headers: res.headers,
            data: data,
            parsedData: null
          }
          
          // 尝试解析JSON
          if (res.headers['content-type']?.includes('application/json')) {
            try {
              result.parsedData = JSON.parse(data)
            } catch (parseError) {
              result.parseError = parseError.message
            }
          }
          
          resolve(result)
        } catch (err) {
          reject(err)
        }
      })
    })
    
    req.on('error', (err) => {
      reject(err)
    })
    
    req.on('timeout', () => {
      req.destroy()
      reject(new Error(`请求超时: ${url}`))
    })
  })
}

// 带重试的请求
async function requestWithRetry(url, options = {}) {
  let lastError
  
  for (let attempt = 1; attempt <= CONFIG.retryAttempts; attempt++) {
    try {
      const result = await makeRequest(url, options)
      return result
    } catch (err) {
      lastError = err
      
      if (attempt < CONFIG.retryAttempts) {
        warning(`请求失败，${CONFIG.retryDelay/1000}秒后重试 (${attempt}/${CONFIG.retryAttempts}): ${err.message}`)
        await new Promise(resolve => setTimeout(resolve, CONFIG.retryDelay))
      }
    }
  }
  
  throw lastError
}

// 基础健康检查
async function basicHealthCheck() {
  info('执行基础健康检查...')
  const checks = []
  
  try {
    // 检查首页
    const homeResponse = await requestWithRetry(CONFIG.baseUrl)
    if (homeResponse.statusCode === 200) {
      success('首页访问正常')
      checks.push({ name: 'homepage', status: 'passed', statusCode: homeResponse.statusCode })
    } else {
      error(`首页访问异常: HTTP ${homeResponse.statusCode}`)
      checks.push({ name: 'homepage', status: 'failed', statusCode: homeResponse.statusCode })
    }
  } catch (err) {
    error(`首页访问失败: ${err.message}`)
    checks.push({ name: 'homepage', status: 'failed', error: err.message })
  }
  
  return checks
}

// API端点检查
async function apiEndpointsCheck() {
  info('检查关键API端点...')
  const checks = []
  
  for (const endpoint of CONFIG.criticalEndpoints) {
    const url = `${CONFIG.baseUrl}${endpoint}`
    
    try {
      const response = await requestWithRetry(url)
      
      if (response.statusCode >= 200 && response.statusCode < 400) {
        success(`${endpoint}: HTTP ${response.statusCode}`)
        checks.push({ 
          name: `api-${endpoint.replace(/[\/]/g, '-')}`, 
          status: 'passed', 
          statusCode: response.statusCode 
        })
      } else if (response.statusCode === 401 || response.statusCode === 403) {
        // 认证相关端点返回401/403是正常的
        success(`${endpoint}: HTTP ${response.statusCode} (需要认证)`)
        checks.push({ 
          name: `api-${endpoint.replace(/[\/]/g, '-')}`, 
          status: 'passed', 
          statusCode: response.statusCode,
          note: '需要认证' 
        })
      } else {
        warning(`${endpoint}: HTTP ${response.statusCode}`)
        checks.push({ 
          name: `api-${endpoint.replace(/[\/]/g, '-')}`, 
          status: 'warning', 
          statusCode: response.statusCode 
        })
      }
    } catch (err) {
      error(`${endpoint}: ${err.message}`)
      checks.push({ 
        name: `api-${endpoint.replace(/[\/]/g, '-')}`, 
        status: 'failed', 
        error: err.message 
      })
    }
  }
  
  return checks
}

// 数据库连接检查
async function databaseCheck() {
  info('检查数据库连接...')
  const checks = []
  
  try {
    // 通过健康检查API验证数据库连接
    const response = await requestWithRetry(`${CONFIG.baseUrl}/api/health`)
    
    if (response.statusCode === 200 && response.parsedData) {
      const healthData = response.parsedData
      
      if (healthData.database === 'connected') {
        success('数据库连接正常')
        checks.push({ name: 'database', status: 'passed' })
      } else {
        error('数据库连接异常')
        checks.push({ name: 'database', status: 'failed', error: '数据库连接失败' })
      }
    } else {
      warning('无法获取数据库状态')
      checks.push({ name: 'database', status: 'warning', note: '无法验证数据库状态' })
    }
  } catch (err) {
    error(`数据库检查失败: ${err.message}`)
    checks.push({ name: 'database', status: 'failed', error: err.message })
  }
  
  return checks
}

// 第三方服务检查
async function thirdPartyServicesCheck() {
  info('检查第三方服务集成...')
  const checks = []
  
  try {
    const response = await requestWithRetry(`${CONFIG.baseUrl}/api/health`)
    
    if (response.statusCode === 200 && response.parsedData) {
      const healthData = response.parsedData
      
      // Google OAuth检查
      if (healthData.auth?.google) {
        success('Google OAuth配置正常')
        checks.push({ name: 'google-auth', status: 'passed' })
      } else {
        warning('Google OAuth配置可能有问题')
        checks.push({ name: 'google-auth', status: 'warning' })
      }
      
      // Stripe检查
      if (healthData.payment?.stripe) {
        success('Stripe支付配置正常')
        checks.push({ name: 'stripe', status: 'passed' })
      } else {
        warning('Stripe支付配置可能有问题')
        checks.push({ name: 'stripe', status: 'warning' })
      }
      
      // AI服务检查
      if (healthData.ai?.fal) {
        success('Fal AI服务配置正常')
        checks.push({ name: 'fal-ai', status: 'passed' })
      } else {
        warning('Fal AI服务配置可能有问题')
        checks.push({ name: 'fal-ai', status: 'warning' })
      }
    }
  } catch (err) {
    error(`第三方服务检查失败: ${err.message}`)
    checks.push({ name: 'third-party', status: 'failed', error: err.message })
  }
  
  return checks
}

// 性能检查
async function performanceCheck() {
  info('执行性能检查...')
  const checks = []
  
  const startTime = Date.now()
  
  try {
    const response = await requestWithRetry(CONFIG.baseUrl)
    const responseTime = Date.now() - startTime
    
    if (responseTime < 3000) {
      success(`响应时间: ${responseTime}ms (良好)`)
      checks.push({ name: 'response-time', status: 'passed', responseTime })
    } else if (responseTime < 5000) {
      warning(`响应时间: ${responseTime}ms (一般)`)
      checks.push({ name: 'response-time', status: 'warning', responseTime })
    } else {
      error(`响应时间: ${responseTime}ms (过慢)`)
      checks.push({ name: 'response-time', status: 'failed', responseTime })
    }
  } catch (err) {
    error(`性能检查失败: ${err.message}`)
    checks.push({ name: 'response-time', status: 'failed', error: err.message })
  }
  
  return checks
}

// 生成健康报告
function generateHealthReport(allChecks) {
  const totalChecks = allChecks.length
  const passedChecks = allChecks.filter(check => check.status === 'passed').length
  const warningChecks = allChecks.filter(check => check.status === 'warning').length
  const failedChecks = allChecks.filter(check => check.status === 'failed').length
  
  const healthScore = Math.round((passedChecks / totalChecks) * 100)
  
  log('\n📊 健康检查报告', 'cyan')
  log('=' * 40, 'cyan')
  log(`总检查项: ${totalChecks}`, 'blue')
  log(`✅ 通过: ${passedChecks}`, 'green')
  log(`⚠️  警告: ${warningChecks}`, 'yellow')
  log(`❌ 失败: ${failedChecks}`, 'red')
  log(`🎯 健康评分: ${healthScore}%`, healthScore >= 80 ? 'green' : healthScore >= 60 ? 'yellow' : 'red')
  
  // 详细失败项
  if (failedChecks > 0) {
    log('\n🚨 失败的检查项:', 'red')
    allChecks.filter(check => check.status === 'failed').forEach(check => {
      log(`   - ${check.name}: ${check.error || '检查失败'}`, 'red')
    })
  }
  
  // 警告项
  if (warningChecks > 0) {
    log('\n⚠️  需要关注的检查项:', 'yellow')
    allChecks.filter(check => check.status === 'warning').forEach(check => {
      log(`   - ${check.name}: ${check.note || '需要检查'}`, 'yellow')
    })
  }
  
  return {
    totalChecks,
    passedChecks,
    warningChecks,
    failedChecks,
    healthScore,
    isHealthy: failedChecks === 0 && healthScore >= 80
  }
}

// 主函数
async function main() {
  log('\n🏥 Sybau Picture 健康检查', 'cyan')
  log(`🌐 检查目标: ${CONFIG.baseUrl}`, 'cyan')
  log(`📅 检查时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`, 'cyan')
  log('=' * 60, 'cyan')
  
  const allChecks = []
  
  try {
    // 执行各项检查
    const basicChecks = await basicHealthCheck()
    allChecks.push(...basicChecks)
    
    const apiChecks = await apiEndpointsCheck()
    allChecks.push(...apiChecks)
    
    const dbChecks = await databaseCheck()
    allChecks.push(...dbChecks)
    
    const serviceChecks = await thirdPartyServicesCheck()
    allChecks.push(...serviceChecks)
    
    const perfChecks = await performanceCheck()
    allChecks.push(...perfChecks)
    
    // 生成报告
    const report = generateHealthReport(allChecks)
    
    // 根据健康状态退出
    if (report.isHealthy) {
      log('\n🎉 系统健康状态良好!', 'green')
      process.exit(0)
    } else {
      log('\n⚠️  系统健康状态需要关注', 'yellow')
      process.exit(1)
    }
    
  } catch (err) {
    error(`健康检查执行失败: ${err.message}`)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main()
}

module.exports = {
  makeRequest,
  requestWithRetry,
  basicHealthCheck,
  apiEndpointsCheck,
  databaseCheck,
  thirdPartyServicesCheck,
  performanceCheck,
  generateHealthReport
}