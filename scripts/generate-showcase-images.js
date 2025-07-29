const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const FormData = require('form-data');

// 9大应用场景的精确提示词配置 - 女性化优化版本（参考SnapEdit设计理念）
const scenarios = [
  {
    id: 'watermark-removal',
    name: '智能去水印',
    processingTime: '12s',
    beforePrompt: 'A beautiful young woman taking a selfie at a scenic mountain lake, with a large visible text watermark "SAMPLE" overlay covering part of the image, natural outdoor lighting, high quality photography',
    afterPrompt: 'Remove the watermark completely while maintaining the original background and woman seamlessly, clean photo without any text overlay',
    beforeFile: 'watermark-before.webp',
    afterFile: 'watermark-after.webp'
  },
  {
    id: 'body-optimization',
    name: '身材优化',
    processingTime: '15s',
    beforePrompt: 'A full body front-facing portrait of a beautiful blonde Caucasian woman with fuller curvy figure, fair pale skin, blue eyes, LARGE bust size, soft rounded belly, thicker waist, fuller thighs and arms, wearing a fitted olive green bodycon dress, standing straight facing camera directly, confident smile, natural lighting, realistic photography, clear body proportions, typical European model features, front view pose only',
    afterPrompt: 'Transform the same blonde Caucasian woman to have a dramatically slimmer figure while MAINTAINING HER EXACT SAME LARGE BUST SIZE - this is crucial, fair pale skin, blue eyes, flat toned belly, narrow waist, slim thighs and arms, same olive dress now appears loose around waist and legs but STILL PERFECTLY FITTED around the chest area showing her preserved large bust, same front-facing pose and camera angle, maintain identical facial features and expression, show clear body transformation to slim figure with PRESERVED LARGE BUST SIZE, European model features, front view, DO NOT reduce bust size',
    beforeFile: 'body-before.webp',
    afterFile: 'body-after.webp'
  },
  {
    id: 'tourist-removal',
    name: '路人移除',
    processingTime: '18s',
    beforePrompt: 'A young woman posing at a beautiful tourist destination with multiple people walking around in the background, famous landmark with crowds of tourists, scenic background with many unwanted people',
    afterPrompt: 'Remove all the background people from the photo while keeping the woman and scenery intact, maintain the exact same image quality, sharpness, and detail level as the original, preserve all architectural details of the landmark, keep the same lighting and color saturation, clean empty landmark with only the main woman subject, high quality result without any blurriness or quality loss',
    beforeFile: 'tourist-before.webp',
    afterFile: 'tourist-after.webp'
  },
  {
    id: 'ecommerce-display',
    name: '电商展示图',
    processingTime: '16s',
    beforePrompt: 'A product photo of a white smartphone lying flat on a cluttered desk with papers, cables and office items around it, harsh overhead fluorescent lighting, amateur photography, no styling, messy background',
    afterPrompt: 'Transform into professional e-commerce product photography: smartphone elegantly positioned on clean marble surface with soft professional lighting, luxury minimalist background, commercial product showcase style, high-end retail display',
    beforeFile: 'product-before.webp',
    afterFile: 'product-after.webp'
  },
  {
    id: 'background-replacement',
    name: '背景替换',
    processingTime: '18s',
    beforePrompt: 'A young woman standing in an indoor office environment with plain walls, wearing professional business attire, neutral background, good lighting on the subject',
    afterPrompt: 'Replace the background with a beautiful sunset beach scene while keeping the woman perfectly intact, natural lighting transition',
    beforeFile: 'bg-before.webp',
    afterFile: 'bg-after.webp'
  },
  {
    id: 'element-integration',
    name: '元素融合',
    processingTime: '20s',
    beforePrompt: 'A beautiful young female fashion model with empty hands in an elegant posed position, professional photography, good lighting, open hands ready to hold something, stylish outfit',
    afterPrompt: 'Make the female model hold a luxury perfume bottle naturally in her hands, seamless integration with proper lighting and shadows',
    beforeFile: 'integration-before.webp',
    afterFile: 'integration-after.webp'
  },
  {
    id: 'style-conversion',
    name: '风格转换',
    processingTime: '14s',
    beforePrompt: 'A realistic portrait photo of a young woman with clear facial features, good lighting, photographic style, natural beauty, soft expression',
    afterPrompt: 'Convert to Japanese anime art style while maintaining the woman\'s identity and facial features, keep her femininity and charm',
    beforeFile: 'style-before.webp',
    afterFile: 'style-after.webp'
  },
  {
    id: 'text-editing',
    name: '文字编辑',
    processingTime: '10s',
    beforePrompt: 'A professional event poster with vibrant design featuring a concert theme, colorful gradient background with musical elements, main title text "ROCK FESTIVAL 2024" in large bold font at the top, subtitle "LIVE MUSIC ALL DAY" in smaller text below, date "JULY 15-16" at the bottom, professional poster layout with decorative elements, high quality design',
    afterPrompt: 'The exact same poster design with identical background, colors, layout and decorative elements, but replace the text content: change "ROCK FESTIVAL 2024" to "JAZZ NIGHT 2024", change "LIVE MUSIC ALL DAY" to "SMOOTH SOUNDS ALL NIGHT", change "JULY 15-16" to "AUGUST 20-21", maintain the same font styles and positioning, perfect text replacement demonstration',
    beforeFile: 'text-before.webp',
    afterFile: 'text-after.webp'
  },
  {
    id: 'detail-modification',
    name: '细节修改',
    processingTime: '12s',
    beforePrompt: 'A portrait photo of a beautiful young Caucasian woman WITHOUT any glasses or sunglasses, clear beautiful face with fully visible eyes, natural makeup, good lighting, NO accessories on face, NO eyewear of any kind, soft smile, clean facial features, fair skin, natural portrait photography',
    afterPrompt: 'Add stylish black designer sunglasses to the same woman naturally, maintaining her facial features and lighting, keep her elegance and smile, same pose and background, show clear transformation from no glasses to wearing fashionable sunglasses, fair skin, European features',
    beforeFile: 'detail-before.webp',
    afterFile: 'detail-after.webp'
  }
];

class ShowcaseImageGenerator {
  constructor() {
    this.apiUrl = 'http://localhost:3003/api/generate';
    this.outputDir = path.join(__dirname, '..', 'public', 'images', 'examples');
    this.targetSize = { width: 1200, height: 900 }; // 参考SnapEdit使用高分辨率
    this.maxFileSize = 200 * 1024; // 增加到200KB以支持高质量图片
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
        timeout: 60000 // 60秒超时
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
      
      // 下载图片
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000
      });

      // 使用Sharp优化图片 - 高质量设置参考SnapEdit
      let optimizedBuffer = await sharp(response.data)
        .resize(this.targetSize.width, this.targetSize.height, {
          fit: 'cover',
          position: 'center'
        })
        .webp({ quality: 95 }) // 提升到95%高质量
        .toBuffer();

      // 如果文件太大，降低质量（但保持较高标准）
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

      // 保存文件
      await fs.writeFile(outputPath, optimizedBuffer);
      
      const fileSizeKB = Math.round(optimizedBuffer.length / 1024);
      console.log(`✅ 图片优化完成: ${path.basename(outputPath)} (${fileSizeKB}KB, 质量: ${quality}%)`);
      
      return optimizedBuffer;
    } catch (error) {
      console.error(`❌ 图片下载优化失败:`, error.message);
      throw error;
    }
  }

  async generateScenarioImages(scenario) {
    console.log(`\n🎯 开始处理场景: ${scenario.name} (${scenario.processingTime})`);
    
    try {
      // Step 1: 生成Before图片
      console.log(`1️⃣ 生成Before图片...`);
      const beforeImageUrl = await this.generateImage(scenario.beforePrompt, 'text-to-image');
      const beforePath = path.join(this.outputDir, scenario.beforeFile);
      const beforeBuffer = await this.downloadAndOptimizeImage(beforeImageUrl, beforePath);

      // 等待一下，避免API限制
      console.log(`⏳ 等待3秒钟...`);
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Step 2: 使用Before图片生成After图片
      console.log(`2️⃣ 生成After图片...`);
      const afterImageUrl = await this.generateImage(scenario.afterPrompt, 'image-to-image', beforeBuffer);
      const afterPath = path.join(this.outputDir, scenario.afterFile);
      await this.downloadAndOptimizeImage(afterImageUrl, afterPath);

      console.log(`✅ 场景 ${scenario.name} 完成！`);
      return { success: true, scenario: scenario.name };

    } catch (error) {
      console.error(`❌ 场景 ${scenario.name} 失败:`, error.message);
      return { success: false, scenario: scenario.name, error: error.message };
    }
  }

  async generateAllImages() {
    console.log(`🚀 开始生成9大应用场景的展示图片`);
    console.log(`📁 输出目录: ${this.outputDir}`);
    console.log(`📐 目标尺寸: ${this.targetSize.width}x${this.targetSize.height}`);
    console.log(`📦 最大文件大小: ${this.maxFileSize / 1024}KB\n`);

    await this.ensureOutputDirectory();

    const results = [];
    let successCount = 0;

    for (let i = 0; i < scenarios.length; i++) {
      const scenario = scenarios[i];
      console.log(`\n📊 进度: ${i + 1}/${scenarios.length}`);
      
      const result = await this.generateScenarioImages(scenario);
      results.push(result);
      
      if (result.success) {
        successCount++;
      }

      // 在场景之间等待，避免API限制
      if (i < scenarios.length - 1) {
        console.log(`⏳ 场景间等待5秒钟...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    // 生成报告
    console.log(`\n📋 生成完成报告:`);
    console.log(`✅ 成功: ${successCount}/${scenarios.length} 个场景`);
    console.log(`❌ 失败: ${scenarios.length - successCount}/${scenarios.length} 个场景`);
    
    results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`   ${status} ${result.scenario}${result.error ? ` - ${result.error}` : ''}`);
    });

    if (successCount === scenarios.length) {
      console.log(`\n🎉 所有图片生成成功！网站展示图片已就绪。`);
    } else {
      console.log(`\n⚠️ 部分图片生成失败，请检查错误信息并重试失败的场景。`);
    }

    return results;
  }
}

// 主函数
async function main() {
  try {
    const generator = new ShowcaseImageGenerator();
    await generator.generateAllImages();
  } catch (error) {
    console.error('❌ 生成过程出错:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = ShowcaseImageGenerator;