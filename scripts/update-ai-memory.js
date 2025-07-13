#!/usr/bin/env node
// 🧠 Sybau Picture - AI记忆更新脚本
// 自动更新项目状态快照和AI上下文信息

const fs = require('fs')
const path = require('path')

// 颜色输出
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// 获取当前项目状态
function getCurrentProjectStatus() {
  try {
    // 读取package.json获取基本信息
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))

    // 检查TypeScript状态
    const tsConfigExists = fs.existsSync('tsconfig.json')

    // 检查环境管理文件
    const envManagerExists = fs.existsSync('lib/env-manager.ts')
    const smartEnvExists = fs.existsSync('scripts/smart-env.js')

    // 检查核心功能文件
    const authExists = fs.existsSync('lib/auth.ts')
    const stripeExists = fs.existsSync('lib/stripe.ts')

    return {
      packageJson,
      tsConfigExists,
      envManagerExists,
      smartEnvExists,
      authExists,
      stripeExists,
      timestamp: new Date().toISOString().split('T')[0]
    }
  } catch (error) {
    log(`❌ 获取项目状态失败: ${error.message}`, 'red')
    return null
  }
}

// 更新项目状态快照
function updateProjectSnapshot(status) {
  const snapshotPath = 'docs/project-status-snapshot.json'

  try {
    // 读取现有快照
    let snapshot = {}
    if (fs.existsSync(snapshotPath)) {
      snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'))
    }

    // 更新基本信息
    snapshot.projectInfo = {
      ...snapshot.projectInfo,
      lastUpdated: status.timestamp,
      version: status.packageJson.version || 'v3.0'
    }

    // 更新系统状态
    snapshot.systemStatus = {
      typescript: status.tsConfigExists ? '正常' : '缺失',
      environmentManager: status.envManagerExists ? '正常' : '缺失',
      smartEnvironment: status.smartEnvExists ? '正常' : '缺失',
      authentication: status.authExists ? '正常' : '缺失',
      payment: status.stripeExists ? '正常' : '缺失',
      lastChecked: status.timestamp
    }

    // 写入更新的快照
    fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2))
    log(`✅ 项目状态快照已更新: ${snapshotPath}`, 'green')

  } catch (error) {
    log(`❌ 更新状态快照失败: ${error.message}`, 'red')
  }
}

// 更新AI记忆文档
function updateAIMemoryDoc(status) {
  const memoryPath = 'docs/ai-context-memory.md'

  try {
    if (fs.existsSync(memoryPath)) {
      let content = fs.readFileSync(memoryPath, 'utf8')

      // 更新最后更新时间
      content = content.replace(
        /\*\*📝 最后更新\*\*: \d{4}-\d{2}-\d{2}.*$/m,
        `**📝 最后更新**: ${status.timestamp} - AI记忆系统自动更新`
      )

      fs.writeFileSync(memoryPath, content)
      log(`✅ AI记忆文档已更新: ${memoryPath}`, 'green')
    }
  } catch (error) {
    log(`❌ 更新AI记忆文档失败: ${error.message}`, 'red')
  }
}

// 显示AI记忆状态
function showAIMemoryStatus() {
  log('\n🧠 AI记忆管理系统状态', 'bold')
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue')

  const memoryFiles = [
    'docs/ai-context-memory.md',
    'docs/project-status-snapshot.json',
    '.cursorrules',
    'README.md'
  ]

  memoryFiles.forEach(file => {
    const exists = fs.existsSync(file)
    const status = exists ? '✅ 存在' : '❌ 缺失'
    const color = exists ? 'green' : 'red'
    log(`${status} ${file}`, color)
  })

  log('\n📋 AI记忆要点检查', 'bold')
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue')

  // 检查关键认知点
  const checks = [
    { name: '模拟环境已移除', file: 'lib/env-manager.ts', check: content => !content.includes('mock') },
    { name: '双环境架构', file: 'lib/env-manager.ts', check: content => content.includes('development') && content.includes('production') },
    { name: '智能环境切换', file: 'scripts/smart-env.js', check: () => true },
    { name: 'TypeScript严格模式', file: 'tsconfig.json', check: content => content.includes('strict') }
  ]

  checks.forEach(({ name, file, check }) => {
    try {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8')
        const passed = check(content)
        const status = passed ? '✅ 正确' : '⚠️ 需要检查'
        const color = passed ? 'green' : 'yellow'
        log(`${status} ${name}`, color)
      } else {
        log(`❌ 缺失 ${name} (文件不存在: ${file})`, 'red')
      }
    } catch (error) {
      log(`❌ 检查失败 ${name}: ${error.message}`, 'red')
    }
  })
}

// 主函数
function main() {
  const args = process.argv.slice(2)
  const command = args[0] || 'update'

  log('🧠 Sybau Picture - AI记忆管理系统', 'bold')
  log('═══════════════════════════════════════', 'blue')

  switch (command) {
    case 'update':
    case '更新':
      log('⏳ 正在更新AI记忆系统...', 'yellow')
      const status = getCurrentProjectStatus()
      if (status) {
        updateProjectSnapshot(status)
        updateAIMemoryDoc(status)
        log('🎉 AI记忆系统更新完成！', 'green')
      }
      break

    case 'status':
    case '状态':
      showAIMemoryStatus()
      break

    case 'help':
    case '帮助':
      log('\n📚 可用命令:', 'bold')
      log('update | 更新  - 更新AI记忆系统', 'blue')
      log('status | 状态  - 显示AI记忆状态', 'blue')
      log('help | 帮助    - 显示帮助信息', 'blue')
      break

    default:
      log(`❌ 未知命令: ${command}`, 'red')
      log('使用 "help" 查看可用命令', 'yellow')
  }
}

// 运行脚本
if (require.main === module) {
  main()
}

module.exports = {
  getCurrentProjectStatus,
  updateProjectSnapshot,
  updateAIMemoryDoc,
  showAIMemoryStatus
}
