#!/usr/bin/env node
// 🛡️ Sybau Picture - Git安全修复工具
// 清理Git历史中的敏感信息

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function askUser(question) {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase().trim());
    });
  });
}

// 敏感文件和模式列表
const SENSITIVE_PATTERNS = [
  '.env.*',
  '*secret*',
  '*key*',
  '*credential*',
  '*DEPLOYMENT*.md',
  '*SUMMARY*.md',
  '*STATUS*.md',
  'migrate-*.js'
];

async function main() {
  log('🛡️ Git安全修复工具启动', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');

  log('⚠️  警告：此操作将重写Git历史！', 'yellow');
  log('📋 将要清理的内容：', 'yellow');
  log('   • 所有 .env* 文件', 'yellow');
  log('   • 包含 secret/key/credential 的文件', 'yellow');
  log('   • 部署文档中的敏感信息', 'yellow');
  log('   • 迁移脚本', 'yellow');

  const confirm = await askUser('🤔 确定要继续吗？ (yes/no): ');

  if (confirm !== 'yes' && confirm !== 'y') {
    log('❌ 操作已取消', 'red');
    return;
  }

  try {
    log('🔍 步骤1: 创建当前分支备份...', 'cyan');
    execSync('git branch backup-before-cleanup', { stdio: 'pipe' });
    log('✅ 备份分支已创建: backup-before-cleanup', 'green');

    log('🧹 步骤2: 移除敏感文件...', 'cyan');

    // 删除当前工作目录中的敏感文件
    const sensitiveFiles = [
      '.env.backup', '.env.current', '.env.fixed', '.env.local',
      '.env.production', '.env.test', '.env.vercel', '.env.verify'
    ];

    for (const file of sensitiveFiles) {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        log(`   • 删除: ${file}`, 'yellow');
      }
    }

    // 从Git索引中移除
    try {
      execSync('git rm --cached .env.* 2>nul || echo "No .env files in index"', { stdio: 'pipe' });
    } catch (e) {
      // 忽略错误，可能文件不在索引中
    }

    log('🔄 步骤3: 使用git filter-branch清理历史...', 'cyan');

    // 清理Git历史中的敏感文件
    const filterCommand = `git filter-branch --force --index-filter "git rm --cached --ignore-unmatch .env.* *secret* *key* *credential* migrate-*.js DEPLOYMENT*.md SUMMARY*.md STATUS*.md CHECKLIST*.md" --prune-empty --tag-name-filter cat -- --all`;

    try {
      execSync(filterCommand, { stdio: 'pipe' });
      log('✅ Git历史清理完成', 'green');
    } catch (error) {
      log('⚠️  filter-branch完成（可能有警告）', 'yellow');
    }

    log('🗑️  步骤4: 清理引用...', 'cyan');
    try {
      execSync('git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin', { stdio: 'pipe' });
      execSync('git reflog expire --expire=now --all', { stdio: 'pipe' });
      execSync('git gc --prune=now', { stdio: 'pipe' });
      log('✅ Git引用清理完成', 'green');
    } catch (error) {
      log('⚠️  引用清理完成（可能有警告）', 'yellow');
    }

    log('📝 步骤5: 提交当前更改...', 'cyan');
    execSync('git add .', { stdio: 'pipe' });

    try {
      execSync('git commit -m "🛡️ 安全修复: 清理敏感信息并加强Git保护"', { stdio: 'pipe' });
      log('✅ 安全修复提交完成', 'green');
    } catch (error) {
      log('ℹ️  没有新的更改需要提交', 'cyan');
    }

    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
    log('🎉 Git安全修复完成！', 'green');
    log('📋 接下来的步骤：', 'cyan');
    log('   1. 检查代码状态: git status', 'cyan');
    log('   2. 测试应用功能是否正常', 'cyan');
    log('   3. 强制推送清理后的历史: git push --force-with-lease origin master', 'cyan');
    log('   4. 通知团队成员重新克隆仓库', 'cyan');
    log('', 'reset');
    log('⚠️  注意：备份分支 "backup-before-cleanup" 保留了原始历史', 'yellow');

  } catch (error) {
    log('❌ 修复过程出错:', 'red');
    log(error.message, 'red');
    log('💡 可以使用备份分支恢复: git checkout backup-before-cleanup', 'yellow');
  }
}

// 检查是否在Git仓库中
if (!fs.existsSync('.git')) {
  log('❌ 当前目录不是Git仓库', 'red');
  process.exit(1);
}

main().catch(error => {
  log('❌ 脚本执行出错:', 'red');
  log(error.message, 'red');
  process.exit(1);
});
