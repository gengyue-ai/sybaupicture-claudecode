const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const FormData = require('form-data');

// 英雄区单组高冲击力展示案例配置
const heroShowcase = {
  id: 'hero-main',
  name: '英雄区主要展示 - 身材优化',
  description: '专为英雄区设计的高冲击力身材优化案例',
  beforePrompt: 'A professional studio portrait of a beautiful young East Asian woman with fair smooth skin, standing straight facing camera front view, wearing a form-fitting light blue dress, naturally fuller figure with soft rounded face, gentle smile, full arms and natural waist, healthy curvy body shape, bright studio lighting, neutral background, high quality photography',
  afterPrompt: 'Transform the exact same woman maintaining her identical facial features and identity, same pose and dress, but with dramatic body transformation: slim defined face with sharp jawline, toned slender arms, extremely slim waist creating perfect hourglass figure, slightly enhanced bust size, flawless fair glowing skin, same sweet expression, stunning body transformation while keeping her recognizable as the same person',
  beforeFile: 'hero-main-before.webp',
  afterFile: 'hero-main-after.webp'
};

class HeroShowcaseGenerator {
  constructor() {
    this.apiUrl = 'http://localhost:3003/api/generate';
    this.outputDir = path.join(__dirname, '..', 'public', 'images', 'hero-showcase');
    this.targetSize = { width: 800, height: 600 }; // 高质量大尺寸展示
    this.maxFileSize = 400 * 1024; // 400KB 提高质量限制
  }

  async ensureOutputDirectory() {
    try {
      await fs.access(this.outputDir);
      console.log(`✅ 输出目录已存在: ${this.outputDir}`);
    } catch {
      await fs.mkdir(this.outputDir, { recursive: true });
      console.log(`✅ 创建输出目录: ${this.outputDir}`);
    }
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
      while (optimizedBuffer.length > this.maxFileSize && quality > 75) {
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

  async generateMainShowcase() {
    console.log(`\n🎯 开始处理英雄区主要展示: ${heroShowcase.name}`);
    
    try {
      // Step 1: 生成Before图片
      console.log(`1️⃣ 生成Before图片...`);
      const beforeImageUrl = await this.generateImage(heroShowcase.beforePrompt, 'text-to-image');
      const beforePath = path.join(this.outputDir, heroShowcase.beforeFile);
      const beforeBuffer = await this.downloadAndOptimizeImage(beforeImageUrl, beforePath);

      console.log(`⏳ 等待3秒钟...`);
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Step 2: 使用Before图片生成After图片
      console.log(`2️⃣ 生成After图片...`);
      const afterImageUrl = await this.generateImage(heroShowcase.afterPrompt, 'image-to-image', beforeBuffer);
      const afterPath = path.join(this.outputDir, heroShowcase.afterFile);
      await this.downloadAndOptimizeImage(afterImageUrl, afterPath);

      console.log(`✅ 英雄区主要展示完成！`);
      return { success: true, showcase: heroShowcase.name };

    } catch (error) {
      console.error(`❌ 英雄区主要展示失败:`, error.message);
      return { success: false, showcase: heroShowcase.name, error: error.message };
    }
  }

  async generateMainHeroShowcase() {
    console.log(`🚀 开始生成英雄区主要展示案例`);
    console.log(`📁 输出目录: ${this.outputDir}`);
    console.log(`📐 目标尺寸: ${this.targetSize.width}x${this.targetSize.height}`);
    console.log(`🎯 生成高质量身材优化对比图片\n`);

    await this.ensureOutputDirectory();

    const result = await this.generateMainShowcase();

    console.log(`\n📋 英雄区主要展示生成报告:`);
    if (result.success) {
      console.log(`✅ 成功生成: ${result.showcase}`);
      console.log(`\n🎉 英雄区主要展示案例生成成功！`);
      console.log(`🎯 高冲击力对比图片将为英雄区带来震撼的视觉效果！`);
    } else {
      console.log(`❌ 生成失败: ${result.showcase} - ${result.error}`);
    }

    return result;
  }
}

// 主函数
async function main() {
  try {
    const generator = new HeroShowcaseGenerator();
    await generator.generateMainHeroShowcase();
  } catch (error) {
    console.error('❌ 生成过程出错:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = HeroShowcaseGenerator;