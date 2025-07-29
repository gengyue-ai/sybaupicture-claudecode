const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const FormData = require('form-data');

// 细节修改场景配置 - 修复逻辑错误
const scenario = {
  id: 'detail-modification',
  name: '细节修改',
  processingTime: '12s',
  beforePrompt: 'A portrait photo of a beautiful young Caucasian woman WITHOUT any glasses or sunglasses, clear beautiful face with fully visible eyes, natural makeup, good lighting, NO accessories on face, NO eyewear of any kind, soft smile, clean facial features, fair skin, natural portrait photography',
  afterPrompt: 'Add stylish black designer sunglasses to the same woman naturally, maintaining her facial features and lighting, keep her elegance and smile, same pose and background, show clear transformation from no glasses to wearing fashionable sunglasses, fair skin, European features',
  beforeFile: 'detail-before.webp',
  afterFile: 'detail-after.webp'
};

class DetailModificationGenerator {
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

  async regenerateDetailModification() {
    console.log(`🚀 修复细节修改场景逻辑错误`);
    console.log(`📝 正确逻辑：Before无眼镜 → After添加墨镜`);
    console.log(`📁 输出目录: ${this.outputDir}`);
    console.log(`📐 目标尺寸: ${this.targetSize.width}x${this.targetSize.height}\n`);

    try {
      // Step 1: 生成Before图片（没有任何眼镜）
      console.log(`1️⃣ 生成Before图片（完全没有眼镜）...`);
      const beforeImageUrl = await this.generateImage(scenario.beforePrompt, 'text-to-image');
      const beforePath = path.join(this.outputDir, scenario.beforeFile);
      const beforeBuffer = await this.downloadAndOptimizeImage(beforeImageUrl, beforePath);

      console.log(`⏳ 等待3秒钟...`);
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Step 2: 使用Before图片生成After图片（添加墨镜）
      console.log(`2️⃣ 生成After图片（添加时尚墨镜）...`);
      const afterImageUrl = await this.generateImage(scenario.afterPrompt, 'image-to-image', beforeBuffer);
      const afterPath = path.join(this.outputDir, scenario.afterFile);
      await this.downloadAndOptimizeImage(afterImageUrl, afterPath);

      console.log(`\n🎉 细节修改场景逻辑错误修复完成！`);
      console.log(`✅ Before图片: ${scenario.beforeFile} (应该没有任何眼镜)`);
      console.log(`✅ After图片: ${scenario.afterFile} (应该添加了时尚墨镜)`);
      console.log(`\n📋 请验证:`);
      console.log(`   - Before图片：眼睛完全可见，没有任何眼镜或墨镜`);
      console.log(`   - After图片：戴着时尚黑色墨镜`);
      console.log(`   - 对比效果：清晰展示AI添加配饰的能力`);

    } catch (error) {
      console.error(`❌ 细节修改场景修复失败:`, error.message);
      throw error;
    }
  }
}

// 主函数
async function main() {
  try {
    const generator = new DetailModificationGenerator();
    await generator.regenerateDetailModification();
  } catch (error) {
    console.error('❌ 修复过程出错:', error);
    process.exit(1);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = DetailModificationGenerator;