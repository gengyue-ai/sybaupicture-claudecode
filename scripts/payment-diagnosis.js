#!/usr/bin/env node

/**
 * 支付系统诊断工具
 * 帮助快速定位支付功能问题
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️ ${msg}${colors.reset}`)
};

async function checkPaymentSystem() {
  console.log(`${colors.blue}🔍 支付系统诊断开始...${colors.reset}\n`);
  
  // 1. 检查环境变量文件
  const envFiles = ['.env', '.env.local', '.env.production'];
  const foundEnvFiles = [];
  
  log.info('检查环境变量文件:');
  envFiles.forEach(file => {
    if (fs.existsSync(file)) {
      foundEnvFiles.push(file);
      log.success(`找到: ${file}`);
    } else {
      log.warn(`缺失: ${file}`);
    }
  });
  
  if (foundEnvFiles.length === 0) {
    log.error('未找到任何环境变量文件！');
    return;
  }
  
  // 2. 检查必需的环境变量
  log.info('\n检查Stripe环境变量配置:');
  const requiredVars = [
    'STRIPE_SECRET_KEY_PROD',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_PROD',
    'STRIPE_PRICE_STANDARD_MONTHLY',
    'STRIPE_PRICE_STANDARD_YEARLY',
    'STRIPE_PRICE_PRO_MONTHLY',
    'STRIPE_PRICE_PRO_YEARLY',
    'STRIPE_WEBHOOK_SECRET'
  ];
  
  const missingVars = [];
  
  // 读取环境变量
  const envContent = {};
  foundEnvFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      content.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
          envContent[key.trim()] = value.trim();
        }
      });
    } catch (error) {
      log.warn(`读取 ${file} 失败: ${error.message}`);
    }
  });
  
  requiredVars.forEach(varName => {
    if (envContent[varName]) {
      log.success(`${varName}: 已配置`);
    } else {
      log.error(`${varName}: 缺失`);
      missingVars.push(varName);
    }
  });
  
  // 3. 提供修复建议
  if (missingVars.length > 0) {
    log.warn(`\n发现 ${missingVars.length} 个缺失的环境变量`);
    log.info('修复建议:');
    console.log('1. 登录 Stripe Dashboard');
    console.log('2. 获取生产环境的API密钥');
    console.log('3. 创建产品和价格ID');
    console.log('4. 配置Webhook端点');
    console.log('5. 将以下环境变量添加到 .env.local:');
    console.log('');
    missingVars.forEach(varName => {
      console.log(`${varName}=你_的_${varName.toLowerCase()}_值`);
    });
  } else {
    log.success('\n✅ 所有必需的环境变量都已配置！');
  }
  
  // 4. 检查API可用性
  log.info('\n检查支付API可用性:');
  try {
    const configCheck = await makeRequest('/api/payment/check-config');
    if (configCheck.status === 'CONFIGURED') {
      log.success('支付系统配置完整');
    } else {
      log.warn(`支付系统配置不完整: ${configCheck.status}`);
      console.log(JSON.stringify(configCheck, null, 2));
    }
  } catch (error) {
    log.error(`配置检查失败: ${error.message}`);
  }
  
  // 5. 测试支付流程
  log.info('\n测试支付流程:');
  try {
    const testResult = await makeRequest('/api/payment/test-flow', 'POST');
    if (testResult.status === 'SUCCESS') {
      log.success('支付流程测试通过');
    } else {
      log.error(`支付流程测试失败: ${testResult.status}`);
      console.log(JSON.stringify(testResult, null, 2));
    }
  } catch (error) {
    log.error(`支付流程测试失败: ${error.message}`);
  }
  
  console.log(`\n${colors.blue}🔍 支付系统诊断完成${colors.reset}`);
}

function makeRequest(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

// 运行诊断
if (require.main === module) {
  checkPaymentSystem().catch(console.error);
}

module.exports = { checkPaymentSystem };