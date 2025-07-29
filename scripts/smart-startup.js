#!/usr/bin/env node

/**
 * 🚀 Sybau Picture - 智能启动脚本
 *
 * 功能：
 * - 自动检查端口占用
 * - 智能终止冲突进程
 * - 一键启动开发服务器
 * - 环境状态检测
 * - 彩色终端输出
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// 彩色输出工具
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  title: (msg) => console.log(`${colors.bright}${colors.magenta}🚀 ${msg}${colors.reset}`),
  separator: () => console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`)
};

// 配置
const CONFIG = {
  port: 3003,
  host: 'localhost',
  maxRetries: 3,
  retryDelay: 1000
};

/**
 * 检查端口是否被占用
 */
function checkPort(port) {
  return new Promise((resolve) => {
    const command = process.platform === 'win32'
      ? `netstat -ano | findstr :${port}`
      : `lsof -ti:${port}`;

    exec(command, (error, stdout) => {
      if (error || !stdout.trim()) {
        resolve({ occupied: false, pids: [] });
        return;
      }

      if (process.platform === 'win32') {
        // Windows: 解析netstat输出
        const lines = stdout.trim().split('\n');
        const pids = lines
          .map(line => {
            const parts = line.trim().split(/\s+/);
            return parts[parts.length - 1];
          })
          .filter(pid => pid && !isNaN(pid))
          .filter((pid, index, self) => self.indexOf(pid) === index); // 去重

        resolve({ occupied: true, pids });
      } else {
        // Unix-like: lsof直接返回PID
        const pids = stdout.trim().split('\n').filter(pid => pid && !isNaN(pid));
        resolve({ occupied: true, pids });
      }
    });
  });
}

/**
 * 终止进程
 */
function killProcess(pid) {
  return new Promise((resolve) => {
    const command = process.platform === 'win32'
      ? `taskkill /PID ${pid} /F`
      : `kill -9 ${pid}`;

    exec(command, (error) => {
      resolve(!error);
    });
  });
}

/**
 * 等待延迟
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 检查环境配置
 */
function checkEnvironment() {
  const envFile = path.join(process.cwd(), '.env.local');

  if (!fs.existsSync(envFile)) {
    return {
      status: 'missing',
      message: '缺少 .env.local 文件'
    };
  }

  const envContent = fs.readFileSync(envFile, 'utf8');
  const hasNextAuthUrl = envContent.includes('NEXTAUTH_URL');
  const hasNextAuthSecret = envContent.includes('NEXTAUTH_SECRET');

  if (!hasNextAuthUrl || !hasNextAuthSecret) {
    return {
      status: 'incomplete',
      message: '环境配置不完整'
    };
  }

  return {
    status: 'ok',
    message: '环境配置正常'
  };
}

/**
 * 启动开发服务器
 */
function startDevServer() {
  return new Promise((resolve, reject) => {
    log.info('启动 Next.js 开发服务器...');

    const devProcess = spawn('npm', ['run', 'dev'], {
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: true
    });

    let isStarted = false;
    let output = '';

    devProcess.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;

      // 检查是否启动成功
      if (text.includes('Ready') || text.includes('ready') || text.includes('compiled')) {
        if (!isStarted) {
          isStarted = true;
          resolve(devProcess);
        }
      }

      // 实时输出
      process.stdout.write(text);
    });

    devProcess.stderr.on('data', (data) => {
      const text = data.toString();
      output += text;

      // 检查错误
      if (text.includes('EADDRINUSE')) {
        reject(new Error('端口仍然被占用'));
        return;
      }

      process.stderr.write(text);
    });

    devProcess.on('error', (error) => {
      reject(error);
    });

    // 超时处理
    setTimeout(() => {
      if (!isStarted) {
        reject(new Error('启动超时'));
      }
    }, 30000);
  });
}

/**
 * 主函数
 */
async function main() {
  try {
    log.title('Sybau Picture 智能启动器 v2.0');
    log.separator();

    // 1. 检查环境配置
    log.info('检查环境配置...');
    const envCheck = checkEnvironment();

    if (envCheck.status === 'ok') {
      log.success(envCheck.message);
    } else {
      log.warning(envCheck.message);
      if (envCheck.status === 'missing') {
        log.info('尝试创建基础 .env.local 文件...');
        const basicEnv = `# 🌍 Sybau Picture - 环境配置
# 生成时间: ${new Date().toISOString()}
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3003
NEXTAUTH_SECRET=${require('crypto').randomBytes(32).toString('base64')}
DEBUG=true
`;
        fs.writeFileSync('.env.local', basicEnv);
        log.success('已创建基础环境配置文件');
      }
    }

    // 2. 检查端口状态
    log.info(`检查端口 ${CONFIG.port} 是否可用...`);
    const portCheck = await checkPort(CONFIG.port);

    if (!portCheck.occupied) {
      log.success(`端口 ${CONFIG.port} 可用`);
    } else {
      log.warning(`端口 ${CONFIG.port} 被占用，进程ID: ${portCheck.pids.join(', ')}`);

      // 3. 终止冲突进程
      log.info('正在终止冲突进程...');
      for (const pid of portCheck.pids) {
        const killed = await killProcess(pid);
        if (killed) {
          log.success(`已终止进程 ${pid}`);
        } else {
          log.warning(`无法终止进程 ${pid}`);
        }
      }

      // 等待进程完全终止
      await delay(2000);

      // 再次检查端口
      const recheckPort = await checkPort(CONFIG.port);
      if (recheckPort.occupied) {
        log.error('部分进程无法终止，请手动处理');
        process.exit(1);
      } else {
        log.success('所有冲突进程已终止');
      }
    }

    // 4. 启动开发服务器
    log.separator();
    log.info('准备启动开发服务器...');

    try {
      const devProcess = await startDevServer();

      log.separator();
      log.success('🎉 开发服务器启动成功！');
      log.info(`🌐 访问地址: http://localhost:${CONFIG.port}`);
      log.info('🔧 按 Ctrl+C 停止服务器');
      log.separator();

      // 优雅退出处理
      process.on('SIGINT', () => {
        log.info('\n正在关闭开发服务器...');
        devProcess.kill('SIGTERM');
        process.exit(0);
      });

      process.on('SIGTERM', () => {
        devProcess.kill('SIGTERM');
        process.exit(0);
      });

    } catch (error) {
      log.error(`启动失败: ${error.message}`);
      process.exit(1);
    }

  } catch (error) {
    log.error(`启动器错误: ${error.message}`);
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main().catch(error => {
    console.error('未处理的错误:', error);
    process.exit(1);
  });
}

module.exports = { main, checkPort, killProcess, checkEnvironment };
