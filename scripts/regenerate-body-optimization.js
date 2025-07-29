const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const FormData = require('form-data');

// 身材优化场景配置
const scenario = {
  id: 'body-optimization',
  name: '身材优化',
  processingTime: '15s',
  beforePrompt: 'A full body front-facing portrait of a beautiful blonde Caucasian woman with fuller curvy figure, fair pale skin, blue eyes, EXTRA LARGE prominent bust size, soft rounded belly, THICK WIDER WAIST, fuller midsection, fuller thighs and arms, wearing a fitted olive green bodycon dress that shows her curvy figure, standing straight facing camera directly, confident smile, natural lighting, realistic photography, clear body proportions with emphasis on wider waist and large chest, typical European model features, front view pose only, curvier fuller body shape',
  afterPrompt: 'Transform the same blonde Caucasian woman to have a dramatically slimmer figure with TINY NARROW WAIST creating perfect hourglass silhouette while MAINTAINING HER EXACT SAME EXTRA LARGE BUST SIZE - this is absolutely crucial, fair pale skin, blue eyes, flat toned belly, DRAMATICALLY NARROWER WAIST, slim thighs and arms, same olive dress now appears loose and baggy around waist and legs but STILL PERFECTLY FITTED and tight around the large chest area showing her preserved extra large bust, same front-facing pose and camera angle, maintain identical facial features and expression, show dramatic body transformation to hourglass figure with TINY WAIST and PRESERVED EXTRA LARGE BUST SIZE, European model features, front view, DO NOT reduce bust size at all',
  beforeFile: 'body-before.webp',
  afterFile: 'body-after.webp'
};

class BodyOptimizationGenerator {
  constructor() {
    this.apiUrl = 'http://localhost:3003/api/generate';
    this.outputDir = path.join(__dirname, '..', 'public', 'images', 'examples');
    this.targetSize = { width: 1200, height: 900 };
    this.maxFileSize = 200 * 1024; // 200KB
  }

  async generateImage(prompt, mode = 'text-to-image', imageData = null) {
    try {
      console.log(`🎨 生成图片: ${prompt.substring(0, 50)}...`);
      
      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('mode', mode);
      formData.append('taskType', 'generate');

      if (imageData && mode === 'image-to-image') {
        formData.append('file', imageData, {
          filename: 'input.jpg',
          contentType: 'image/jpeg'
        });
      }

      const response = await axios.post(this.apiUrl, formData, {
        headers: {
          ...formData.getHeaders(),
          'x-admin-secret': process.env.SHOWCASE_ADMIN_SECRET || 'showcase-2025-secret-key-dev-only'
        },
        timeout: 60000
      });

      if (response.data.success && response.data.imageUrl) {
        console.log(`✅ 图片生成成功`);
        return response.data.imageUrl;
      } else {
        throw new Error(response.data.error || '图片生成失败');
      }
    } catch (error) {
      console.error(`❌ 图片生成失败:`, error.message);
      throw error;
    }
  }

  async downloadAndOptimizeImage(imageUrl, outputPath) {
    try {
      console.log(`⬇️ 下载图片: ${imageUrl}`);
      
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000
      });

      let optimizedBuffer = await sharp(response.data)
        .resize(this.targetSize.width, this.targetSize.height, {
          fit: 'cover',
          position: 'center'
        })
        .webp({ quality: 95 })
        .toBuffer();

      let quality = 95;
      while (optimizedBuffer.length > this.maxFileSize && quality > 70) {
        quality -= 5;
        optimizedBuffer = await sharp(response.data)
          .resize(this.targetSize.width, this.targetSize.height, {
            fit: 'cover',
            position: 'center'
          })
          .webp({ quality })
          .toBuffer();
      }

      await fs.writeFile(outputPath, optimizedBuffer);
      
      const fileSizeKB = Math.round(optimizedBuffer.length / 1024);
      console.log(`✅ 图片优化完成: ${path.basename(outputPath)} (${fileSizeKB}KB, 质量: ${quality}%)`);
      
      return optimizedBuffer;
    } catch (error) {
      console.error(`❌ 图片下载优化失败:`, error.message);
      throw error;
    }
  }

  async regenerateBodyOptimization() {
    console.log(`🚀 重新生成身材优化场景图片`);
    console.log(`📁 输出目录: ${this.outputDir}`);
    console.log(`📐 目标尺寸: ${this.targetSize.width}x${this.targetSize.height}\n`);

    try {
      // Step 1: 生成Before图片（丰满身材）
      console.log(`1️⃣ 生成Before图片（丰满身材）...`);
      const beforeImageUrl = await this.generateImage(scenario.beforePrompt, 'text-to-image');
      const beforePath = path.join(this.outputDir, scenario.beforeFile);
      const beforeBuffer = await this.downloadAndOptimizeImage(beforeImageUrl, beforePath);

      console.log(`⏳ 等待3秒钟...`);
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Step 2: 使用Before图片生成After图片（苗条身材）
      console.log(`2️⃣ 生成After图片（苗条身材）...`);
      const afterImageUrl = await this.generateImage(scenario.afterPrompt, 'image-to-image', beforeBuffer);
      const afterPath = path.join(this.outputDir, scenario.afterFile);
      await this.downloadAndOptimizeImage(afterImageUrl, afterPath);

      console.log(`\n🎉 身材优化场景重新生成完成！`);
      console.log(`✅ Before图片: ${scenario.beforeFile}`);
      console.log(`✅ After图片: ${scenario.afterFile}`);
      console.log(`\n请检查图片对比效果是否明显展示了胖瘦和胸围的变化。`);

    } catch (error) {
      console.error(`❌ 身材优化场景生成失败:`, error.message);
      throw error;
    }
  }
}

// 主函数
async function main() {
  try {
    const generator = new BodyOptimizationGenerator();
    await generator.regenerateBodyOptimization();
  } catch (error) {
    console.error('❌ 生成过程出错:', error);
    process.exit(1);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = BodyOptimizationGenerator;