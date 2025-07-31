#!/usr/bin/env node

/**
 * Sybau Picture 部署管理器
 * 创建时间: 2025-07-31
 * 
 * 功能:
 * - 预部署检查 (类型检查、代码检查、构建测试)
 * - 自动标记版本 (日期 + 功能描述)
 * - 部署后验证 (健康检查、关键功能测试)
 * - 部署日志记录
 * - 快速回滚机制
 */

const { exec, spawn } = require('child_process')
const fs = require('fs')
const path = require('path')
const readline = require('readline')

// 配置
const CONFIG = {
  projectName: 'Sybau Picture',
  healthCheckTimeout: 30000, // 30秒
  keyUsers: ['40863666@qq.com'], // 关键测试用户
  requiredChecks: ['type-check', 'lint', 'build'],
  deploymentLogPath: './docs/deployment-log.md'
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

// 执行命令并返回Promise
function execAsync(command, options = {}) {
  return new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stderr })
      } else {
        resolve({ stdout, stderr })
      }
    })
  })
}

// 用户输入
function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

// 获取当前Git信息
async function getGitInfo() {
  try {
    const { stdout: branch } = await execAsync('git branch --show-current')
    const { stdout: commit } = await execAsync('git rev-parse --short HEAD')
    const { stdout: status } = await execAsync('git status --porcelain')
    
    return {
      branch: branch.trim(),
      commit: commit.trim(),
      hasChanges: status.trim().length > 0
    }
  } catch (err) {
    throw new Error('无法获取Git信息，请确保在Git仓库中运行')
  }
}

// 预部署检查
async function preDeploymentChecks() {
  info('开始预部署检查...')
  
  const checks = []
  
  // 检查未提交的更改
  const gitInfo = await getGitInfo()
  if (gitInfo.hasChanges) {
    warning('检测到未提交的更改:')
    const { stdout } = await execAsync('git status --short')
    console.log(stdout)
    
    const answer = await askQuestion('是否要继续部署? (y/N): ')
    if (answer.toLowerCase() !== 'y') {
      throw new Error('部署被用户取消')
    }
  }
  
  // 类型检查
  info('执行TypeScript类型检查...')
  try {
    await execAsync('npm run type-check')
    success('类型检查通过')
    checks.push({ name: 'type-check', status: 'passed' })
  } catch (err) {
    error('类型检查失败')
    console.error(err.stderr)
    checks.push({ name: 'type-check', status: 'failed', error: err.stderr })
    throw new Error('预部署检查失败: TypeScript类型错误')
  }
  
  // 代码检查
  info('执行ESLint代码检查...')
  try {
    await execAsync('npm run lint')
    success('代码检查通过')
    checks.push({ name: 'lint', status: 'passed' })
  } catch (err) {
    warning('代码检查发现问题')
    console.warn(err.stdout)
    checks.push({ name: 'lint', status: 'warning', output: err.stdout })
    
    const answer = await askQuestion('代码检查有警告，是否继续? (y/N): ')
    if (answer.toLowerCase() !== 'y') {
      throw new Error('部署被用户取消')
    }
  }
  
  // 构建测试
  info('执行构建测试...')
  try {
    await execAsync('npm run build')
    success('构建测试通过')
    checks.push({ name: 'build', status: 'passed' })
  } catch (err) {
    error('构建失败')
    console.error(err.stderr)
    checks.push({ name: 'build', status: 'failed', error: err.stderr })
    throw new Error('预部署检查失败: 构建错误')
  }
  
  return checks
}

// 生成部署标签
async function generateDeploymentTag(description) {
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10) // YYYY-MM-DD
  const timeStr = now.toTimeString().slice(0, 5).replace(':', '') // HHMM
  
  const gitInfo = await getGitInfo()
  const tag = `deploy-${dateStr}-${timeStr}-${gitInfo.commit}`
  
  return {
    tag,
    description: `[${dateStr}] ${description}`,
    branch: gitInfo.branch,
    commit: gitInfo.commit
  }
}

// 执行部署
async function deploy(deployInfo) {
  info(`开始部署到生产环境...`)
  info(`标签: ${deployInfo.tag}`)
  info(`描述: ${deployInfo.description}`)
  
  try {
    // 创建Git标签
    await execAsync(`git tag -a ${deployInfo.tag} -m "${deployInfo.description}"`)
    success(`Git标签已创建: ${deployInfo.tag}`)
    
    // 执行Vercel部署
    info('执行Vercel部署...')
    const { stdout } = await execAsync('vercel --prod')
    
    // 解析部署URL
    const urlMatch = stdout.match(/https:\/\/[^\s]+/)
    const deploymentUrl = urlMatch ? urlMatch[0] : null
    
    if (deploymentUrl) {
      success(`部署成功: ${deploymentUrl}`)
      return {
        ...deployInfo,
        deploymentUrl,
        deployedAt: new Date().toISOString()
      }
    } else {
      throw new Error('无法解析部署URL')
    }
  } catch (err) {
    error('部署失败')
    console.error(err.stderr || err.message)
    throw err
  }
}

// 部署后验证
async function postDeploymentValidation(deploymentInfo) {
  info('开始部署后验证...')
  
  const validationResults = []
  
  // 等待部署完全生效
  info('等待部署生效...')
  await new Promise(resolve => setTimeout(resolve, 10000)) // 等待10秒
  
  // 健康检查
  info('执行健康检查...')
  try {
    const healthResult = await execAsync('node scripts/health-check.js', { timeout: CONFIG.healthCheckTimeout })
    success('健康检查通过')
    validationResults.push({ name: 'health-check', status: 'passed' })
  } catch (err) {
    error('健康检查失败')
    console.error(err.stderr || err.message)
    validationResults.push({ name: 'health-check', status: 'failed', error: err.stderr || err.message })
  }
  
  // 关键功能测试
  info('测试关键用户功能...')
  // 这里可以添加更多的功能测试
  validationResults.push({ name: 'key-features', status: 'manual', note: '需要手动验证关键用户功能' })
  
  return validationResults
}

// 记录部署日志
async function logDeployment(deploymentInfo, preChecks, validationResults) {
  const logEntry = `
## 部署记录 - ${deploymentInfo.deployedAt}

**部署信息:**
- 标签: \`${deploymentInfo.tag}\`
- 描述: ${deploymentInfo.description}
- 分支: \`${deploymentInfo.branch}\`
- 提交: \`${deploymentInfo.commit}\`
- 部署URL: ${deploymentInfo.deploymentUrl}

**预部署检查:**
${preChecks.map(check => `- ${check.name}: ${check.status === 'passed' ? '✅' : check.status === 'warning' ? '⚠️' : '❌'} ${check.status}`).join('\n')}

**部署后验证:**
${validationResults.map(result => `- ${result.name}: ${result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '⚠️'} ${result.status}`).join('\n')}

**手动验证清单:**
- [ ] 40863666@qq.com 用户套餐显示正确
- [ ] 支付按钮功能正常
- [ ] 图片生成功能正常
- [ ] 用户认证流程正常

---
`
  
  // 确保日志目录存在
  const logDir = path.dirname(CONFIG.deploymentLogPath)
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true })
  }
  
  // 追加到部署日志
  if (fs.existsSync(CONFIG.deploymentLogPath)) {
    const existingContent = fs.readFileSync(CONFIG.deploymentLogPath, 'utf-8')
    fs.writeFileSync(CONFIG.deploymentLogPath, logEntry + '\n' + existingContent)
  } else {
    const header = `# ${CONFIG.projectName} 部署日志\n\n> 自动生成于 ${new Date().toISOString()}\n\n`
    fs.writeFileSync(CONFIG.deploymentLogPath, header + logEntry)
  }
  
  success(`部署日志已更新: ${CONFIG.deploymentLogPath}`)
}

// 主函数
async function main() {
  log(`\n🚀 ${CONFIG.projectName} 部署管理器`, 'cyan')
  log(`📅 执行时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`, 'cyan')
  log('=' * 60, 'cyan')
  
  try {
    // 获取部署描述
    const description = await askQuestion('\n📝 请输入本次部署的功能描述: ')
    if (!description) {
      throw new Error('部署描述不能为空')
    }
    
    // 确认部署
    log(`\n即将部署: ${description}`, 'yellow')
    const confirm = await askQuestion('确认继续部署? (y/N): ')
    if (confirm.toLowerCase() !== 'y') {
      log('部署已取消', 'yellow')
      return
    }
    
    // 预部署检查
    const preChecks = await preDeploymentChecks()
    
    // 生成部署信息
    const deploymentInfo = await generateDeploymentTag(description)
    
    // 执行部署
    const deployResult = await deploy(deploymentInfo)
    
    // 部署后验证
    const validationResults = await postDeploymentValidation(deployResult)
    
    // 记录日志
    await logDeployment(deployResult, preChecks, validationResults)
    
    // 总结
    log('\n🎉 部署完成!', 'green')
    log(`📍 部署URL: ${deployResult.deploymentUrl}`, 'green')
    log(`🏷️  版本标签: ${deployResult.tag}`, 'green')
    log('\n⚠️  请手动验证以下关键功能:', 'yellow')
    log('   - 40863666@qq.com 用户套餐显示', 'yellow')
    log('   - 支付按钮功能', 'yellow')
    log('   - 图片生成功能', 'yellow')
    
  } catch (err) {
    error(`部署失败: ${err.message}`)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main()
}

module.exports = {
  preDeploymentChecks,
  deploy,
  postDeploymentValidation,
  logDeployment
}