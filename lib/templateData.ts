// 模板数据结构定义
export interface TemplateData {
  id: string
  category: 'life-enhancement' | 'business-creation' | 'creative-conversion'
  title: { zh: string; en: string }
  description: { zh: string; en: string }
  beforeImage: string
  afterImage: string
  prompt: { zh: string; en: string }
  recommendedMode: 'text-to-image' | 'image-to-image'
  aiModel: 'flux/dev' | 'flux-pro/kontext'
  optimalSettings: {
    style: string
    intensity: number
    // Kontext专用优化参数
    num_inference_steps?: number
    guidance_scale?: number
    safety_tolerance?: number
    seed?: number
    width?: number
    height?: number
  }
  processingTime: { zh: string; en: string }
}

// 9大应用场景模板数据 - 基于画廊的实际数据
export const templateData: Record<string, TemplateData> = {
  // 生活增强类
  'watermark-removal': {
    id: 'watermark-removal',
    category: 'life-enhancement',
    title: { zh: '智能去水印', en: 'Smart Watermark Removal' },
    description: { zh: '一键去除各种复杂水印，保持背景完整', en: 'Remove any complex watermarks with one click' },
    beforeImage: '/images/examples/watermark-before.webp',
    afterImage: '/images/examples/watermark-after.webp',
    prompt: { zh: '移除水印', en: 'remove all watermarks and text overlays, completely clean image' },
    recommendedMode: 'image-to-image',
    aiModel: 'flux-pro/kontext',
    optimalSettings: {
      style: 'classic',
      intensity: 4,
      num_inference_steps: 50,
      guidance_scale: 3.5,
      safety_tolerance: 2,
      seed: 123456,
      width: 800,
      height: 500
    },
    processingTime: { zh: '12秒', en: '12s' }
  },

  'body-optimization': {
    id: 'body-optimization',
    category: 'life-enhancement',
    title: { zh: '身材优化', en: 'Body Optimization' },
    description: { zh: '瘦脸/瘦腿/减肚子/增肌，自然无痕', en: 'Face slimming/leg slimming/belly reduction/muscle enhancement, natural and seamless' },
    beforeImage: '/images/examples/body-before.webp',
    afterImage: '/images/examples/body-after.webp',
    prompt: { zh: '优化身材比例', en: 'Optimize body proportions' },
    recommendedMode: 'image-to-image',
    aiModel: 'flux-pro/kontext',
    optimalSettings: {
      style: 'classic',
      intensity: 2,
      num_inference_steps: 50,
      guidance_scale: 3.5,
      safety_tolerance: 2,
      seed: 123456
    },
    processingTime: { zh: '15秒', en: '15s' }
  },

  'tourist-removal': {
    id: 'tourist-removal',
    category: 'life-enhancement',
    title: { zh: '路人移除', en: 'Tourist Removal' },
    description: { zh: '独享美景，告别路人抢镜', en: 'Enjoy scenery alone, say goodbye to photobombers' },
    beforeImage: '/images/examples/tourist-before.webp',
    afterImage: '/images/examples/tourist-after.webp',
    prompt: { zh: '移除背景人物', en: 'Remove background people' },
    recommendedMode: 'image-to-image',
    aiModel: 'flux-pro/kontext',
    optimalSettings: {
      style: 'classic',
      intensity: 2,
      num_inference_steps: 50,
      guidance_scale: 3.5,
      safety_tolerance: 2,
      seed: 123456
    },
    processingTime: { zh: '18秒', en: '18s' }
  },

  // 商业创作类
  'ecommerce-display': {
    id: 'ecommerce-display',
    category: 'business-creation',
    title: { zh: '电商展示图', en: 'E-commerce Display Images' },
    description: { zh: '一键生成专业产品展示图', en: 'Generate professional product images with one click' },
    beforeImage: '/images/examples/product-before.webp',
    afterImage: '/images/examples/product-after.webp',
    prompt: { zh: '改善产品展示背景', en: 'Improve product display background' },
    recommendedMode: 'image-to-image',
    aiModel: 'flux-pro/kontext',
    optimalSettings: {
      style: 'professional',
      intensity: 3,
      num_inference_steps: 50,
      guidance_scale: 3.5,
      safety_tolerance: 2,
      seed: 123456
    },
    processingTime: { zh: '16秒', en: '16s' }
  },

  'background-replacement': {
    id: 'background-replacement',
    category: 'business-creation',
    title: { zh: '背景替换', en: 'Background Replacement' },
    description: { zh: '瞬间穿越，任意场景切换', en: 'Instant space travel, change any scene' },
    beforeImage: '/images/examples/bg-before.webp',
    afterImage: '/images/examples/bg-after.webp',
    prompt: { zh: '替换背景为海滩', en: 'Replace background with beach' },
    recommendedMode: 'image-to-image',
    aiModel: 'flux-pro/kontext',
    optimalSettings: {
      style: 'professional',
      intensity: 3,
      num_inference_steps: 50,
      guidance_scale: 3.5,
      safety_tolerance: 2,
      seed: 123456
    },
    processingTime: { zh: '18秒', en: '18s' }
  },

  'element-integration': {
    id: 'element-integration',
    category: 'business-creation',
    title: { zh: '元素融合', en: 'Element Integration' },
    description: { zh: '多图合成，让模特拿着你的产品', en: 'Multi-image combination, let models hold your products' },
    beforeImage: '/images/examples/integration-before.webp',
    afterImage: '/images/examples/integration-after.webp',
    prompt: { zh: '添加产品到手中', en: 'Add product to hands' },
    recommendedMode: 'image-to-image',
    aiModel: 'flux-pro/kontext',
    optimalSettings: {
      style: 'professional',
      intensity: 3,
      num_inference_steps: 50,
      guidance_scale: 3.5,
      safety_tolerance: 2,
      seed: 123456
    },
    processingTime: { zh: '20秒', en: '20s' }
  },

  // 创意转换类
  'style-conversion': {
    id: 'style-conversion',
    category: 'creative-conversion',
    title: { zh: '风格转换', en: 'Style Conversion' },
    description: { zh: '真人照片↔动漫，保持身份特征的完美风格转换', en: 'Real photo ↔ Anime, perfect style conversion while preserving identity' },
    beforeImage: '/images/examples/style-before.webp',
    afterImage: '/images/examples/style-after.webp',
    prompt: { 
      zh: '转换为动漫风格，保持人物特征', 
      en: 'Convert to anime art style while maintaining character identity' 
    },
    recommendedMode: 'image-to-image',
    aiModel: 'flux-pro/kontext',
    optimalSettings: {
      style: 'creative',
      intensity: 3,
      num_inference_steps: 50,
      guidance_scale: 3.5,      // 使用官方推荐值，已通过官方风格转换示例验证
      safety_tolerance: 2,      // 使用官方推荐值  
      seed: 123456
    },
    processingTime: { zh: '14秒', en: '14s' }
  },

  'text-editing': {
    id: 'text-editing',
    category: 'creative-conversion',
    title: { zh: '文字编辑', en: 'Text Editing' },
    description: { zh: '自由修改海报文字，支持任意字体', en: 'Modify poster text freely, support any fonts' },
    beforeImage: '/images/examples/text-before.webp',
    afterImage: '/images/examples/text-after.webp',
    prompt: { zh: '修改文字内容', en: 'Modify text content' },
    recommendedMode: 'image-to-image',
    aiModel: 'flux-pro/kontext',
    optimalSettings: {
      style: 'classic',
      intensity: 3,
      num_inference_steps: 50,
      guidance_scale: 3.5,
      safety_tolerance: 2,
      seed: 123456
    },
    processingTime: { zh: '10秒', en: '10s' }
  },

  'detail-modification': {
    id: 'detail-modification',
    category: 'creative-conversion',
    title: { zh: '细节修改', en: 'Detail Modification' },
    description: { zh: '加墨镜、换甜品，轻松微调', en: 'Add sunglasses, change desserts, effortless fine-tuning' },
    beforeImage: '/images/examples/detail-before.webp',
    afterImage: '/images/examples/detail-after.webp',
    prompt: { zh: '添加时尚墨镜', en: 'Add stylish sunglasses' },
    recommendedMode: 'image-to-image',
    aiModel: 'flux-pro/kontext',
    optimalSettings: {
      style: 'creative',
      intensity: 3,
      num_inference_steps: 50,
      guidance_scale: 3.5,
      safety_tolerance: 2,
      seed: 123456
    },
    processingTime: { zh: '12秒', en: '12s' }
  },

  // 首页场景展示模板 - 专为"立即创作同款"功能设计
  'photography-showcase': {
    id: 'photography-showcase',
    category: 'life-enhancement',
    title: { zh: '全家福人物选择性移除', en: 'Selective Family Photo Editing' },
    description: { zh: '智能移除家庭照片中的指定人物，保持背景和其他人物完整', en: 'Intelligently remove specific people from family photos while keeping background and others intact' },
    beforeImage: '/images/scenarios/photography-before.webp',
    afterImage: '/images/scenarios/photography-after.webp',
    prompt: { 
      zh: '移除三个年轻人', 
      en: 'Remove the three younger people' 
    },
    recommendedMode: 'image-to-image',
    aiModel: 'flux-pro/kontext',
    optimalSettings: { 
      style: 'classic', 
      intensity: 2,
      num_inference_steps: 50,
      guidance_scale: 3.5,
      safety_tolerance: 2,
      seed: 123456
    },
    processingTime: { zh: '15秒', en: '15s' }
  },

  'ecommerce-showcase': {
    id: 'ecommerce-showcase', 
    category: 'business-creation',
    title: { zh: '产品背景专业替换', en: 'Professional Product Background Replacement' },
    description: { zh: '保持产品完全不变，替换为专业科技光效背景', en: 'Keep product completely unchanged, replace with professional tech lighting background' },
    beforeImage: '/images/scenarios/ecommerce-before.webp',
    afterImage: '/images/scenarios/ecommerce-after.webp',
    prompt: { 
      zh: '将背景改为红色霓虹环境', 
      en: 'Change background to futuristic red neon environment' 
    },
    recommendedMode: 'image-to-image',
    aiModel: 'flux-pro/kontext', 
    optimalSettings: { 
      style: 'professional', 
      intensity: 3,
      num_inference_steps: 50,
      guidance_scale: 3.5,
      safety_tolerance: 2,
      seed: 123456
    },
    processingTime: { zh: '12秒', en: '12s' }
  },

  'fashion-showcase': {
    id: 'fashion-showcase',
    category: 'creative-conversion', 
    title: { zh: '人物色温风格调整', en: 'Portrait Color Temperature Style Adjustment' },
    description: { zh: '调整人物照片色温，从暖色调变成冷色调霓虹效果', en: 'Adjust portrait color temperature from warm tones to cool neon style effects' },
    beforeImage: '/images/scenarios/fashion-before.webp',
    afterImage: '/images/scenarios/fashion-after.webp',
    prompt: { 
      zh: '将背景改为简洁的工作室背景', 
      en: 'Change background to clean studio backdrop' 
    },
    recommendedMode: 'image-to-image',
    aiModel: 'flux-pro/kontext',
    optimalSettings: { 
      style: 'professional', 
      intensity: 2,
      num_inference_steps: 50,
      guidance_scale: 3.5,
      safety_tolerance: 2,
      seed: 123456
    },
    processingTime: { zh: '10秒', en: '10s' }
  },

  'travel-showcase': {
    id: 'travel-showcase',
    category: 'life-enhancement',
    title: { zh: '景区路人智能移除', en: 'Smart Tourist Removal from Scenic Spots' },
    description: { zh: '移除景区路人，只保留主要人物，营造私密浪漫氛围', en: 'Remove tourists from scenic spots, keep only main subjects for intimate romantic atmosphere' },
    beforeImage: '/images/scenarios/travel-before.webp', 
    afterImage: '/images/scenarios/travel-after.webp',
    prompt: { 
      zh: '移除所有背景人物', 
      en: 'Remove all background people' 
    },
    recommendedMode: 'image-to-image',
    aiModel: 'flux-pro/kontext',
    optimalSettings: { 
      style: 'classic', 
      intensity: 2,
      num_inference_steps: 50,
      guidance_scale: 3.5,
      safety_tolerance: 2,
      seed: 123456
    },
    processingTime: { zh: '18秒', en: '18s' }
  },

  'realestate-showcase': {
    id: 'realestate-showcase',
    category: 'business-creation',
    title: { zh: '室内空间整理优化', en: 'Interior Space Organization' },
    description: { zh: '整理桌面杂物，优化空间摆放，营造温馨展示氛围', en: 'Organize table clutter, optimize space arrangement, create cozy display atmosphere' },
    beforeImage: '/images/scenarios/realestate-before.webp',
    afterImage: '/images/scenarios/realestate-after.webp', 
    prompt: { 
      zh: '移除桌面上的所有物品', 
      en: 'Remove all items from table surface' 
    },
    recommendedMode: 'image-to-image',
    aiModel: 'flux-pro/kontext',
    optimalSettings: { 
      style: 'classic', 
      intensity: 2,
      num_inference_steps: 50,
      guidance_scale: 3.5,
      safety_tolerance: 2,
      seed: 123456
    },
    processingTime: { zh: '14秒', en: '14s' }
  }
}

// 获取单个模板数据
export const getTemplateById = (id: string): TemplateData | null => {
  return templateData[id] || null
}

// 分类信息
export const categoryInfo = {
  'life-enhancement': {
    zh: '生活增强',
    en: 'Life Enhancement',
    icon: '🎨'
  },
  'business-creation': {
    zh: '商业创作',
    en: 'Business Creation', 
    icon: '🛍️'
  },
  'creative-conversion': {
    zh: '创意转换',
    en: 'Creative Conversion',
    icon: '🎭'
  }
}