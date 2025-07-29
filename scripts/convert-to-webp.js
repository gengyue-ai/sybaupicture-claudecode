/**
 * 图片格式转换脚本 - JPG转WebP
 * 用于更新画廊中的动漫风格转换示例
 */

const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const INPUT_FILE = path.join(__dirname, '..', 'public', 'images', 'examples', 'sybau-generated-1753781568322.jpg')
const OUTPUT_FILE = path.join(__dirname, '..', 'public', 'images', 'examples', 'style-after-new.webp')
const BACKUP_FILE = path.join(__dirname, '..', 'public', 'images', 'examples', 'style-after.backup.webp')
const TARGET_FILE = path.join(__dirname, '..', 'public', 'images', 'examples', 'style-after.webp')

async function convertToWebP() {
  try {
    console.log('🔄 开始转换图片格式...')
    
    // 检查输入文件是否存在
    if (!fs.existsSync(INPUT_FILE)) {
      throw new Error(`输入文件不存在: ${INPUT_FILE}`)
    }
    
    console.log(`📷 输入文件: ${INPUT_FILE}`)
    
    // 转换为WebP格式
    await sharp(INPUT_FILE)
      .resize(800, 500, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ 
        quality: 85,
        effort: 6 // 更好的压缩效果
      })
      .toFile(OUTPUT_FILE)
    
    console.log(`✅ 图片转换成功: ${OUTPUT_FILE}`)
    
    // 获取文件大小信息
    const inputStats = fs.statSync(INPUT_FILE)
    const outputStats = fs.statSync(OUTPUT_FILE)
    
    console.log(`📊 原文件大小: ${Math.round(inputStats.size / 1024)}KB`)
    console.log(`📊 新文件大小: ${Math.round(outputStats.size / 1024)}KB`)
    console.log(`📉 压缩率: ${Math.round((1 - outputStats.size / inputStats.size) * 100)}%`)
    
    return OUTPUT_FILE
    
  } catch (error) {
    console.error('❌ 图片转换失败:', error.message)
    throw error
  }
}

async function backupAndReplace() {
  try {
    console.log('🔄 备份并替换现有文件...')
    
    // 备份原有文件
    if (fs.existsSync(TARGET_FILE)) {
      fs.copyFileSync(TARGET_FILE, BACKUP_FILE)
      console.log(`📦 原文件已备份: ${BACKUP_FILE}`)
    }
    
    // 替换文件
    if (fs.existsSync(OUTPUT_FILE)) {
      fs.copyFileSync(OUTPUT_FILE, TARGET_FILE)
      console.log(`✅ 文件替换成功: ${TARGET_FILE}`)
      
      // 删除临时文件
      fs.unlinkSync(OUTPUT_FILE)
      console.log('🗑️ 临时文件已清理')
    }
    
  } catch (error) {
    console.error('❌ 文件替换失败:', error.message)
    throw error
  }
}

async function main() {
  console.log('🎨 动漫风格转换图片更新工具')
  console.log('=' .repeat(50))
  
  try {
    // 1. 转换图片格式
    await convertToWebP()
    
    // 2. 备份并替换现有文件
    await backupAndReplace()
    
    console.log('=' .repeat(50))
    console.log('🎉 图片更新完成！')
    console.log('💡 新的动漫风格转换示例已部署')
    console.log('📍 备份文件位置:', BACKUP_FILE)
    
  } catch (error) {
    console.error('\n❌ 执行失败:', error.message)
    process.exit(1)
  }
}

// 运行脚本
if (require.main === module) {
  main()
}

module.exports = { main }