const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const FormData = require('form-data');

// 文字编辑场景配置 - 海报文字替换
const textEditingScenario = {
  id: 'text-editing',
  name: '文字编辑 - 海报文字替换',
  processingTime: '10s',
  beforePrompt: 'A professional event poster with vibrant design featuring a concert theme, colorful gradient background with musical elements, main title text "ROCK FESTIVAL 2024" in large bold font at the top, subtitle "LIVE MUSIC ALL DAY" in smaller text below, date "JULY 15-16" at the bottom, professional poster layout with decorative elements, high quality design',
  afterPrompt: 'The exact same poster design with identical background, colors, layout and decorative elements, but replace the text content: change "ROCK FESTIVAL 2024" to "JAZZ NIGHT 2024", change "LIVE MUSIC ALL DAY" to "SMOOTH SOUNDS ALL NIGHT", change "JULY 15-16" to "AUGUST 20-21", maintain the same font styles and positioning, perfect text replacement demonstration',
  beforeFile: 'text-before.webp',
  afterFile: 'text-after.webp'
};

class TextEditingGenerator {
  constructor() {
    this.apiUrl = 'http://localhost:3003/api/generate';
    this.outputDir = path.join(__dirname, '..', 'public', 'images', 'examples');
    this.targetSize = { width: 1200, height: 900 };
    this.maxFileSize = 200 * 1024; // 200KB
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

  async generateTextEditingScenario() {
    console.log(`\n🎯 开始处理文字编辑场景: ${textEditingScenario.name}`);
    
    try {
      // Step 1: 生成Before图片（摇滚音乐节海报）
      console.log(`1️⃣ 生成Before图片（摇滚音乐节海报）...`);
      const beforeImageUrl = await this.generateImage(textEditingScenario.beforePrompt, 'text-to-image');
      const beforePath = path.join(this.outputDir, textEditingScenario.beforeFile);
      const beforeBuffer = await this.downloadAndOptimizeImage(beforeImageUrl, beforePath);

      console.log(`⏳ 等待3秒钟...`);
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Step 2: 使用Before图片生成After图片（爵士之夜海报）
      console.log(`2️⃣ 生成After图片（爵士之夜海报）...`);
      const afterImageUrl = await this.generateImage(textEditingScenario.afterPrompt, 'image-to-image', beforeBuffer);
      const afterPath = path.join(this.outputDir, textEditingScenario.afterFile);
      await this.downloadAndOptimizeImage(afterImageUrl, afterPath);

      console.log(`✅ 文字编辑场景完成！`);
      return { success: true, scenario: textEditingScenario.name };

    } catch (error) {
      console.error(`❌ 文字编辑场景失败:`, error.message);
      return { success: false, scenario: textEditingScenario.name, error: error.message };
    }
  }

  async regenerateTextEditing() {
    console.log(`🚀 开始重新生成画廊文字编辑场景`);
    console.log(`📁 输出目录: ${this.outputDir}`);
    console.log(`📐 目标尺寸: ${this.targetSize.width}x${this.targetSize.height}`);
    console.log(`🎯 生成海报文字替换对比图片\n`);

    await this.ensureOutputDirectory();

    const result = await this.generateTextEditingScenario();

    console.log(`\n📋 文字编辑场景生成报告:`);
    if (result.success) {
      console.log(`✅ 成功生成: ${result.scenario}`);
      console.log(`\n🎉 画廊文字编辑场景重新生成成功！`);
      console.log(`🎯 清晰的海报文字替换效果："ROCK FESTIVAL 2024" → "JAZZ NIGHT 2024"！`);
    } else {
      console.log(`❌ 生成失败: ${result.scenario} - ${result.error}`);
    }

    return result;
  }
}

// 主函数
async function main() {
  try {
    const generator = new TextEditingGenerator();
    await generator.regenerateTextEditing();
  } catch (error) {
    console.error('❌ 生成过程出错:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = TextEditingGenerator;