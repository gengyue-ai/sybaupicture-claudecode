const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const FormData = require('form-data');

// 路人移除场景配置 - 修复质量下降问题
const scenario = {
  id: 'tourist-removal',
  name: '路人移除',
  processingTime: '18s',
  beforePrompt: 'A young woman posing at a beautiful tourist destination with multiple people walking around in the background, famous landmark with crowds of tourists, scenic background with many unwanted people',
  afterPrompt: 'Remove all the background people from the photo while keeping the woman and scenery intact, maintain the exact same image quality, sharpness, and detail level as the original, preserve all architectural details of the landmark, keep the same lighting and color saturation, clean empty landmark with only the main woman subject, high quality result without any blurriness or quality loss',
  beforeFile: 'tourist-before.webp',
  afterFile: 'tourist-after.webp'
};

class TouristRemovalGenerator {
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

  async regenerateTouristRemoval() {
    console.log(`🚀 修复路人移除场景的图片质量问题`);
    console.log(`📝 目标：保持Before图片的高质量，移除路人但不降低画质`);
    console.log(`📁 输出目录: ${this.outputDir}`);
    console.log(`📐 目标尺寸: ${this.targetSize.width}x${this.targetSize.height}\n`);

    try {
      // 读取现有的Before图片作为输入
      const beforePath = path.join(this.outputDir, scenario.beforeFile);
      console.log(`📖 读取现有Before图片: ${scenario.beforeFile}`);
      const beforeBuffer = await fs.readFile(beforePath);

      console.log(`⏳ 等待3秒钟...`);
      await new Promise(resolve => setTimeout(resolve, 3000));

      // 使用优化后的提示词重新生成After图片
      console.log(`🔄 重新生成After图片（强调质量保持）...`);
      const afterImageUrl = await this.generateImage(scenario.afterPrompt, 'image-to-image', beforeBuffer);
      const afterPath = path.join(this.outputDir, scenario.afterFile);
      await this.downloadAndOptimizeImage(afterImageUrl, afterPath);

      console.log(`\n🎉 路人移除场景质量优化完成！`);
      console.log(`✅ Before图片: ${scenario.beforeFile} (保持原有高质量)`);
      console.log(`✅ After图片: ${scenario.afterFile} (应该保持相同质量水平)`);
      console.log(`\n📋 请验证:`);
      console.log(`   - After图片质量应该与Before图片相当`);
      console.log(`   - 背景路人被完全移除`);
      console.log(`   - 建筑细节和清晰度保持完整`);
      console.log(`   - 主体女性完整保留`);

    } catch (error) {
      console.error(`❌ 路人移除质量优化失败:`, error.message);
      throw error;
    }
  }
}

// 主函数
async function main() {
  try {
    const generator = new TouristRemovalGenerator();
    await generator.regenerateTouristRemoval();
  } catch (error) {
    console.error('❌ 优化过程出错:', error);
    process.exit(1);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = TouristRemovalGenerator;