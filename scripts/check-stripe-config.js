// 检查Stripe配置状态
const fs = require('fs');
const path = require('path');

// 读取环境变量
function checkEnvironmentVariables() {
  const prodVars = [
    'STRIPE_SECRET_KEY',
    'STRIPE_SECRET_KEY_PROD',
    'STRIPE_SECRET_KEY_PRO',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_PROD', 
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_PRO',
    'STRIPE_WEBHOOK_SECRET'
  ];

  console.log('🔍 检查Stripe环境变量配置:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const missingVars = [];
  const configuredVars = [];

  prodVars.forEach(varName => {
    const value = process.env[varName];
    if (value && value.trim() !== '') {
      configuredVars.push(varName);
      console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
    } else {
      missingVars.push(varName);
      console.log(`❌ ${varName}: 未配置`);
    }
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ 已配置: ${configuredVars.length}/${prodVars.length}`);
  console.log(`❌ 缺失: ${missingVars.length}/${prodVars.length}`);

  if (missingVars.length > 0) {
    console.log('\n⚠️  建议配置以下环境变量:');
    missingVars.forEach(varName => {
      console.log(`   ${varName}`);
    });
  }

  // 检查是否有最基本的配置
  const hasSecretKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY_PROD || process.env.STRIPE_SECRET_KEY_PRO;
  const hasPublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_PROD || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_PRO;

  console.log('\n📋 基本配置状态:');
  console.log(`   Secret Key: ${hasSecretKey ? '✅ 已配置' : '❌ 缺失'}`);
  console.log(`   Publishable Key: ${hasPublishableKey ? '✅ 已配置' : '❌ 缺失'}`);
  
  return {
    hasSecretKey: !!hasSecretKey,
    hasPublishableKey: !!hasPublishableKey,
    configuredVars,
    missingVars
  };
}

// 从key.md文件读取正确的配置值
function getCorrectValues() {
  try {
    const keyContent = fs.readFileSync(path.join(process.cwd(), 'key.md'), 'utf8');
    console.log('\n📁 从key.md读取正确配置:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const lines = keyContent.split('\n');
    const config = {};
    
    lines.forEach((line, index) => {
      // 查找STRIPE_SECRET_KEY行
      if (line.includes('STRIPE_SECRET_KEY:')) {
        const nextLine = lines[index + 1];
        if (nextLine && nextLine.startsWith('sk_live_')) {
          config.secretKey = nextLine.trim();
          console.log(`✅ Secret Key: ${nextLine.trim().substring(0, 15)}...`);
        }
      }
      // 查找NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY行
      if (line.includes('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:')) {
        const nextLine = lines[index + 1];
        if (nextLine && nextLine.startsWith('"pk_live_')) {
          // 移除引号
          config.publishableKey = nextLine.trim().replace(/"/g, '');
          console.log(`✅ Publishable Key: ${config.publishableKey.substring(0, 15)}...`);
        }
      }
      // 查找STRIPE_WEBHOOK_SECRET行
      if (line.includes('STRIPE_WEBHOOK_SECRET:')) {
        const nextLine = lines[index + 1];
        if (nextLine && nextLine.startsWith('whsec_')) {
          config.webhookSecret = nextLine.trim();
          console.log(`✅ Webhook Secret: ${nextLine.trim().substring(0, 15)}...`);
        }
      }
      
      // 也尝试在同一行查找
      if (line.startsWith('sk_live_')) {
        config.secretKey = line.trim();
        console.log(`✅ Secret Key: ${line.trim().substring(0, 15)}...`);
      }
      if (line.includes('pk_live_')) {
        const match = line.match(/pk_live_[\w]+/);
        if (match) {
          config.publishableKey = match[0];
          console.log(`✅ Publishable Key: ${match[0].substring(0, 15)}...`);
        }
      }
      if (line.startsWith('whsec_')) {
        config.webhookSecret = line.trim();
        console.log(`✅ Webhook Secret: ${line.trim().substring(0, 15)}...`);
      }
    });
    
    // 调试输出
    console.log('\n🔍 调试信息:');
    console.log(`   找到的配置数量: ${Object.keys(config).length}`);
    console.log(`   Secret Key: ${config.secretKey ? '已找到' : '未找到'}`);
    console.log(`   Publishable Key: ${config.publishableKey ? '已找到' : '未找到'}`);
    console.log(`   Webhook Secret: ${config.webhookSecret ? '已找到' : '未找到'}`);
    
    return config;
  } catch (error) {
    console.log('❌ 无法读取key.md文件:', error.message);
    return {};
  }
}

// 生成Vercel环境变量设置命令
function generateVercelCommands(config) {
  if (!config.secretKey || !config.publishableKey) {
    console.log('\n❌ 缺少必要的配置值，无法生成Vercel命令');
    return;
  }

  console.log('\n🚀 Vercel环境变量设置命令:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('# 复制以下命令到终端执行:');
  console.log();
  console.log(`vercel env add STRIPE_SECRET_KEY production`);
  console.log(`# 输入值: ${config.secretKey}`);
  console.log();
  console.log(`vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production`);
  console.log(`# 输入值: ${config.publishableKey}`);
  console.log();
  if (config.webhookSecret) {
    console.log(`vercel env add STRIPE_WEBHOOK_SECRET production`);
    console.log(`# 输入值: ${config.webhookSecret}`);
    console.log();
  }
  console.log('# 设置完成后重新部署:');
  console.log('vercel --prod');
}

// 主函数
function main() {
  console.log('🎯 Stripe配置诊断工具');
  console.log('═══════════════════════════════════════════════════════════════════');
  
  const envStatus = checkEnvironmentVariables();
  const correctConfig = getCorrectValues();
  
  if (!envStatus.hasSecretKey || !envStatus.hasPublishableKey) {
    console.log('\n⚠️  支付功能被禁用 - 缺少必要的Stripe配置');
    generateVercelCommands(correctConfig);
  } else {
    console.log('\n✅ Stripe配置看起来正常');
  }
  
  console.log('\n═══════════════════════════════════════════════════════════════════');
}

main(); 