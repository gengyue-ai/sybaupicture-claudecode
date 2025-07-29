const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const FormData = require('form-data');

// SnapEdit风格英雄区横幅配置
const heroBannerConfig = {
  id: 'hero-banner',
  name: 'SnapEdit风格英雄区横幅',
  description: '参考SnapEdit.app的主视觉设计风格',
  prompt: 'Professional AI image editing showcase banner, split-screen design showing before and after transformation of a beautiful woman portrait, left side: original natural photo, right side: enhanced edited version with perfect skin and lighting, clean modern layout with purple to cyan gradient background, professional studio photography, high-end commercial design, minimalist aesthetic, ultra-wide format banner, sophisticated visual hierarchy, premium brand look',
  outputFile: 'hero-banner.webp',
  targetSize: { width: 1920, height: 800 }, // 21:9 横幅比例
  maxFileSize: 300 * 1024 // 300KB
};

class HeroBannerGenerator {
  constructor() {
    this.apiUrl = 'http://localhost:3003/api/generate';
    this.outputDir = path.join(__dirname, '..', 'public', 'images', 'hero');
    this.config = heroBannerConfig;
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

      // 使用Sharp优化图片 - 高质量横幅设置
      let optimizedBuffer = await sharp(response.data)
        .resize(this.config.targetSize.width, this.config.targetSize.height, {
          fit: 'cover',
          position: 'center'
        })
        .webp({ quality: 95 })
        .toBuffer();

      // 如果文件太大，适当降低质量
      let quality = 95;
      while (optimizedBuffer.length > this.config.maxFileSize && quality > 80) {
        quality -= 5;
        optimizedBuffer = await sharp(response.data)
          .resize(this.config.targetSize.width, this.config.targetSize.height, {
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

  async generateHeroBanner() {
    console.log(`🚀 生成SnapEdit风格英雄区横幅`);
    console.log(`📁 输出目录: ${this.outputDir}`);
    console.log(`📐 目标尺寸: ${this.config.targetSize.width}x${this.config.targetSize.height}`);
    console.log(`📋 描述: ${this.config.description}\n`);

    try {
      await this.ensureOutputDirectory();

      // 生成英雄区横幅图
      console.log(`🎨 生成英雄区横幅...`);
      const bannerImageUrl = await this.generateImage(this.config.prompt, 'text-to-image');
      const bannerPath = path.join(this.outputDir, this.config.outputFile);
      await this.downloadAndOptimizeImage(bannerImageUrl, bannerPath);

      console.log(`\n🎉 SnapEdit风格英雄区横幅生成完成！`);
      console.log(`✅ 横幅图片: ${this.config.outputFile}`);
      console.log(`📏 尺寸: ${this.config.targetSize.width}x${this.config.targetSize.height} (21:9)`);
      console.log(`\n🎯 下一步：在HomePageClient.tsx中集成这个横幅图片`);

    } catch (error) {
      console.error(`❌ 英雄区横幅生成失败:`, error.message);
      throw error;
    }
  }
}

// 主函数
async function main() {
  try {
    const generator = new HeroBannerGenerator();
    await generator.generateHeroBanner();
  } catch (error) {
    console.error('❌ 生成过程出错:', error);
    process.exit(1);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = HeroBannerGenerator;