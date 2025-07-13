export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'zh', name: 'Chinese', native: '中文' },
] as const

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]['code']

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en'

export function isValidLanguage(lang: string): lang is SupportedLanguage {
  return SUPPORTED_LANGUAGES.some(l => l.code === lang)
}

export function getLanguageInfo(code: SupportedLanguage) {
  return SUPPORTED_LANGUAGES.find(l => l.code === code)
}

// 备用翻译数据
export const fallbackTranslations = {
  '/': {
    'en': {
      home: {
        hero: {
          title: 'Create Viral',
          subtitle: 'Sybau Memes',
          tagline: 'in Seconds',
          description: 'Transform any photo into hilarious Sybau style memes with our AI technology. No design skills required - just upload and watch the magic happen!'
        },
        benefits: {
          free: '100% Free',
          noRegistration: 'Google登录',
          hdQuality: 'HD Quality',
          fastProcessing: '8s Processing'
        },
        cta: {
          createNow: 'Create Now',
          viewExamples: 'View Examples',
          startCreating: 'Start Creating Now',
          readStories: 'Read Success Stories',
          title: 'Ready to Go Viral? 🚀',
          description: 'Join millions of creators who are already using Sybau Picture to create viral content'
        },
        socialProof: 'Trusted by creators worldwide',
        stats: {
          memes: 'Memes Created',
          rating: 'User Rating',
          countries: 'Countries'
        },
        features: {
          title: 'Why Choose Sybau Picture?',
          description: 'Experience the power of AI-driven meme creation',
          aiPowered: {
            title: 'AI-Powered',
            description: 'Advanced AI technology for perfect results'
          },
          lightning: {
            title: 'Lightning Fast',
            description: 'Generate memes in just 8 seconds'
          },
          easy: {
            title: 'Easy to Use',
            description: 'No design skills needed'
          }
        }
      },
      nav: {
        generator: 'Generator',
        gallery: 'Gallery',
        pricing: 'Pricing',
        blog: 'Blog',
        about: 'About',
        tryFree: 'Try Free',
        createNow: 'Create Now',
        create: 'Create',
        language: 'Language',
        stats: 'Platform Stats',
        creations: 'Creations',
        rating: 'Rating',
        startCreating: 'Start Creating',
        followUs: 'Follow Us',
        helpCenter: 'Help Center',
        home: 'Home'
      },
      features: {
        title: 'Why Choose Sybau Picture?',
        subtitle: 'The ultimate AI meme generator',
        description: 'Experience the power of AI-driven meme creation',
        feature1: {
          title: 'Lightning Fast',
          description: 'Generate memes in just 8 seconds'
        },
        feature2: {
          title: 'HD Quality',
          description: 'Professional quality output every time'
        },
        feature3: {
          title: 'Easy to Use',
          description: 'No design skills needed'
        },
        aiPowered: {
          title: 'AI-Powered',
          description: 'Advanced AI technology for perfect results'
        },
        fastProcessing: {
          title: 'Lightning Fast',
          description: 'Generate memes in just 8 seconds'
        },
        multiLanguage: {
          title: 'Multi-Language',
          description: 'Supports 10+ languages worldwide'
        },
        privacyFirst: {
          title: 'Privacy First',
          description: 'Your data is safe and secure'
        }
      },
      whatIs: {
        title: 'What is Sybau Style?',
        description: 'A unique AI art style that creates viral meme content',
        content: 'Sybau Style is a cutting-edge AI art style specifically designed for creating viral meme content. This innovative approach combines advanced machine learning with internet culture to produce images that are both hilarious and shareable.'
      },
      howTo: {
        title: 'How to Create Your Meme',
        step1: 'Upload your photo',
        step2: 'Choose style settings',
        step3: 'Generate with AI',
        step4: 'Download & share'
      },
      faq: {
        title: 'Frequently Asked Questions',
        q1: 'Is it really free?',
        a1: 'Yes, completely free with no hidden costs.',
        q2: 'Do I need to sign up?',
        a2: 'No signup required, just sign in with Google to start creating.',
        q3: 'What file formats are supported?',
        a3: 'We support JPG, PNG, and WebP formats.'
      },
      blog: {
        title: 'Sybau Story Center',
        description: 'Explore Sybau Guy\'s inspirational stories, learn creation techniques, discover the infinite possibilities of AI memes',
        searchPlaceholder: 'Search inspirational stories, creation tips, success cases...',
        featured: 'Featured',
        allPosts: 'All Articles',
        articlesCount: 'articles',
        readTime: ' min',
        readFullStory: 'Read Full Story',
        readArticle: 'Read Article',
        noArticles: 'No articles found',
        tryAdjust: 'Try adjusting search terms or selecting other categories',
        resetFilter: 'Reset Filter',
        categories: {
          all: 'All',
          inspiration: 'Inspirational Stories',
          technical: 'Technical Comparisons',
          tutorial: 'Tutorials',
          values: 'Values & Philosophy',
          success: 'Success Cases',
          creation: 'Creation',
          memes: 'Memes',
          editing: 'Photo Editing',
          comparison: 'Comparison',
          beginners: 'Beginner Guide',
          tips: 'Tips',
          philosophy: 'Philosophy',
          happiness: 'Happiness',
          freedom: 'Freedom',
          viral: 'Viral Spread',
          popular: 'Popular'
        },
        posts: {
          sybauStory: {
            title: '🚀 Sybau Guy\'s Rise: From Zero to Meme King',
            excerpt: 'How an ordinary person rose from the bottom using Sybau technology to become the most popular meme creator online. A story of persistence, innovation, and never giving up.'
          },
          comparison: {
            title: '🎭 Sybau vs Traditional Editing: AI Era Creative Revolution',
            excerpt: 'Why Sybau technology completely outperforms traditional photo editing software? See these stunning comparison cases and understand the true power of AI creation!'
          },
          tutorial: {
            title: '🎪 Master Sybau Picture in 5 Minutes: From Novice to Expert',
            excerpt: 'Even beginners can become meme masters! Detailed step-by-step tutorials to help you quickly master all features of Sybau Picture and create amazing works.'
          },
          philosophy: {
            title: '🌈 Sybau\'s Philosophy: Spreading Joy and Freedom with AI',
            excerpt: 'Deep dive into the values and philosophy behind Sybau. Explore how to spread positive energy through AI technology, allowing everyone to freely express creativity.'
          },
          successCases: {
            title: '🏆 Sybau Success Cases: How These Works Went Viral',
            excerpt: 'Analyze the most successful Sybau creation cases, reveal the secrets of viral spread. Learn how to create popular content with 100k+ likes.'
          }
        },
        cta: {
          title: 'Feeling Inspired?',
          description: 'After reading these inspirational stories and success cases, it\'s time to start your own creative journey!',
          startCreating: 'Start Creating Now',
          shareStory: 'Share Your Story'
        }
      },
      gallery: {
        title: 'Creative Gallery',
        subtitle: 'Admire AI-created magical effects and feel the creative transformation from ordinary to amazing',
        searchPlaceholder: 'Search creative works...',
        stats: {
          creations: 'Total Creations',
          users: 'Active Users',
          satisfaction: 'Satisfaction',
          service: 'Online Service'
        },
        categories: {
          all: 'All',
          daily: 'Daily Life',
          work: 'Work Life',
          study: 'Study Life',
          pets: 'Pets',
          food: 'Food Life',
          travel: 'Travel',
          sports: 'Sports & Fitness'
        },
        tabs: {
          featured: 'Featured',
          comparisons: 'Comparison Cases',
          userWorks: 'User Works'
        },
        comparisonCases: [
          {
            title: 'Office Slacking vs AI Transformation',
            description: 'Ordinary office scenes transformed into funny memes through AI',
            category: 'Daily Life'
          },
          {
            title: 'Pet Photos vs Funny Transformation',
            description: 'Cute pet photos transformed into viral funny content',
            category: 'Pets'
          },
          {
            title: 'Food Photography vs Quirky Style',
            description: 'Ordinary food photos converted to hilarious Sybau style',
            category: 'Food'
          },
          {
            title: 'Fitness vs Motivational Transformation',
            description: 'Fitness photos transformed into inspiring funny memes',
            category: 'Sports'
          },
          {
            title: 'Travel Scenery vs Quirky Processing',
            description: 'Ordinary travel photos processed into interesting creative works',
            category: 'Travel'
          },
          {
            title: 'Study Time vs Funny Conversion',
            description: 'Boring study scenes transformed into smile-inducing memes',
            category: 'Study'
          }
        ],
        userWorks: [
          {
            title: 'Monday Morning Me',
            author: 'Student Ming',
            category: 'Daily Complaints'
          },
          {
            title: 'First Day of Diet',
            author: 'Fitness Expert',
            category: 'Motivational Funny'
          },
          {
            title: 'Pre-Exam State',
            author: 'Straight-A Student Li',
            category: 'Study Life'
          },
          {
            title: 'Working Until Late Night',
            author: 'Programmer Wang',
            category: 'Work Life'
          },
          {
            title: 'Weekend Home Lounging',
            author: 'Lazy Person',
            category: 'Leisure Life'
          },
          {
            title: 'Me Seeing the Bill',
            author: 'Spender',
            category: 'Life Insights'
          }
        ]
      },
      about: {
        title: 'About Sybau Picture',
        subtitle: 'Empowering Creativity Through AI',
        description: 'We\'re on a mission to democratize meme creation by making professional-quality AI image generation accessible to everyone, everywhere.',
        backToHome: 'Back to Home',
        tryGenerator: 'Try Generator',
        stats: {
          memesCreated: 'Memes Created',
          activeUsers: 'Active Users',
          countriesServed: 'Countries Served',
          uptime: 'Uptime'
        },
        mission: {
          title: 'Our Mission',
          description: 'To break down the barriers between imagination and creation. We believe everyone has the potential to create content that resonates, entertains, and connects people across cultures.'
        },
        vision: {
          title: 'Our Vision',
          description: 'A world where creativity knows no bounds. We envision a future where AI amplifies human creativity rather than replacing it.'
        },
        values: {
          title: 'Our Values',
          subtitle: 'The principles that guide every decision we make and every feature we build.',
          innovation: {
            title: 'Innovation First',
            description: 'We push the boundaries of AI technology to make creativity accessible to everyone.'
          },
          community: {
            title: 'Community Driven',
            description: 'Our users are at the heart of everything we do. We build for creators, by creators.'
          },
          privacy: {
            title: 'Privacy Focused',
            description: 'Your data is yours. We believe in transparency and user control over personal information.'
          },
          global: {
            title: 'Globally Inclusive',
            description: 'Memes transcend borders. We\'re building a platform that celebrates all cultures and languages.'
          }
        },
        team: {
          title: 'Meet Our Team',
          subtitle: 'The passionate individuals behind Sybau Picture'
        },
        journey: {
          title: 'Our Journey',
          subtitle: 'From idea to global platform'
        }
      },
      generator: {
        title: 'AI Meme Generator',
        subtitle: 'Transform your photos into viral Sybau memes',
        backToHome: 'Back to Home',
        upload: {
          title: 'Upload Your Photo',
          description: 'Drag and drop your image or click to browse',
          supportedFormats: 'Supports JPG, PNG, WEBP up to 5MB',
          dragActive: 'Drop your image here',
          selectFile: 'Select File',
          or: 'or'
        },
        settings: {
          title: 'Style Settings',
          style: 'Style',
          intensity: 'Intensity',
          styles: {
            classic: 'Classic',
            exaggerated: 'Exaggerated',
            minimal: 'Minimal'
          }
        },
        process: {
          title: 'Generate',
          processing: 'Processing...',
          generate: 'Generate Meme',
          progress: 'Progress'
        },
        result: {
          title: 'Your Meme is Ready!',
          processingTime: 'Processing time',
          seconds: 'seconds',
          download: 'Download',
          share: 'Share',
          createAnother: 'Create Another',
          copySuccess: 'Link copied to clipboard!'
        },
        errors: {
          invalidFileType: 'Please upload a valid image file (JPG, PNG, WEBP)',
          fileTooLarge: 'File size must be less than 5MB',
          processingFailed: 'Processing failed',
          somethingWrong: 'Something went wrong'
        }
      },
      footer: {
        description: 'The world\'s first AI meme platform focused on Sybau Lazer Dim 700 style. Making viral funny content creation accessible to everyone.',
        product: {
          title: 'Product',
          generator: 'AI Generator',
          gallery: 'Gallery',
          blog: 'Blog',
          about: 'About Us'
        },
        resources: {
          title: 'Resources',
          help: 'Help Center',
          updates: 'Latest Updates',
          api: 'API Docs',
          developers: 'Developers'
        },
        company: {
          title: 'Company',
          privacy: 'Privacy Policy',
          terms: 'Terms of Service',
          contact: 'Contact Us',
          careers: 'Careers'
        },
        support: {
          title: 'Support',
          help: 'Help Center',
          community: 'Community',
          feedback: 'Feedback',
          technical: 'Technical Support'
        },
        newsletter: {
          title: 'Subscribe',
          description: 'Get latest updates and creative inspiration',
          placeholder: 'Enter your email'
        },
        privacy: 'Privacy Policy',
        terms: 'Terms of Service',
        language: 'Language',
        copyright: '© 2024 Sybau Picture. All rights reserved.',
        madeWith: 'Made with'
      }
    },
    'zh': {
      hero: {
        title: '创作病毒式',
        subtitle: '几秒钟完成',
        description: '使用我们的AI技术将任何照片转换成有创意的风格图片。无需设计技能 - 只需上传并观看奇迹发生！',
        benefit1: '100% 免费',
        benefit2: 'Google登录',
        benefit3: '高清质量',
        benefit4: '8秒处理',
        socialProof: '全球创作者信赖',
        stat1: '已创建表情包',
        stat2: '用户评分',
        stat3: '覆盖国家'
      },
      home: {
        hero: {
          title: '创建病毒式',
          subtitle: 'Sybau表情包',
          tagline: '仅需几秒',
          description: '使用我们的AI技术将任何照片转换成有创意的风格图片！无需设计技能 - 只需上传并观看奇迹发生！'
        },
        benefits: {
          free: '100%免费',
          noRegistration: 'Google登录',
          hdQuality: '高清质量',
          fastProcessing: '8秒处理'
        },
        cta: {
          createNow: '立即创建',
          viewExamples: '查看示例',
          startCreating: '立即开始创作',
          readStories: '阅读成功故事',
          title: '准备好成为网红了吗？🚀',
          description: '加入数百万已经在使用Sybau Picture制作病毒式内容的创作者行列'
        },
        socialProof: '全球创作者信赖之选',
        stats: {
          memes: '表情包创建数',
          rating: '用户评分',
          countries: '服务国家'
        },
        features: {
          title: '为什么选择Sybau Picture？',
          description: '体验AI驱动的表情包创作力量',
          aiPowered: {
            title: 'AI驱动',
            description: '先进AI技术确保完美效果'
          },
          lightning: {
            title: '闪电般快速',
            description: '仅需8秒生成表情包'
          },
          easy: {
            title: '简单易用',
            description: '无需设计技能'
          }
        }
      },
      nav: {
        generator: '生成器',
        gallery: '画廊',
        pricing: '定价',
        blog: '博客',
        about: '关于我们',
        tryFree: '免费试用',
        createNow: '立即创建',
        create: '创作',
        language: '语言设置',
        stats: '平台数据',
        creations: '创作数量',
        rating: '用户评分',
        startCreating: '开始创作表情包',
        followUs: '关注我们',
        helpCenter: '帮助中心',
        home: '首页'
      },
      features: {
        title: '为什么选择Sybau Picture？',
        subtitle: '终极AI表情包生成器',
        description: '体验AI驱动的表情包创作力量',
        feature1: {
          title: '闪电般快速',
          description: '仅需8秒生成表情包'
        },
        feature2: {
          title: '高清质量',
          description: '每次都提供专业质量输出'
        },
        feature3: {
          title: '易于使用',
          description: '无需设计技能'
        },
        aiPowered: {
          title: 'AI驱动',
          description: '先进AI技术确保完美效果'
        },
        fastProcessing: {
          title: '闪电般快速',
          description: '仅需8秒生成表情包'
        },
        multiLanguage: {
          title: '多语言支持',
          description: '支持全球10+种语言'
        },
        privacyFirst: {
          title: '隐私优先',
          description: '您的数据安全可靠'
        }
      },
      whatIs: {
        title: '什么是Sybau创意风格？',
        description: '一种独特的AI艺术风格，创造病毒式创意内容',
        content: 'Sybau创意风格是一种专门为创造病毒式创意内容而设计的前沿AI艺术风格。这种创新方法将先进的机器学习与互联网文化相结合，产生既有创意又易于分享的图像。'
      },
      howTo: {
        title: '如何创建您的表情包',
        step1: '上传您的照片',
        step2: '选择风格设置',
        step3: '使用AI生成',
        step4: '下载并分享'
      },
      faq: {
        title: '常见问题',
        q1: '真的免费吗？',
        a1: '是的，完全免费，没有隐藏费用。',
        q2: '需要注册吗？',
        a2: '无需注册，使用Google账户即可开始创作。',
        q3: '支持哪些文件格式？',
        a3: '我们支持JPG、PNG和WebP格式。'
      },
      blog: {
        title: 'Sybau故事中心',
        description: '探索Sybau Guy的励志故事，学习创作技巧，发现AI表情包的无限可能',
        searchPlaceholder: '搜索励志故事、创作技巧、成功案例...',
        featured: '精选',
        allPosts: '所有文章',
        articlesCount: '篇文章',
        readTime: '分钟',
        readFullStory: '阅读完整故事',
        readArticle: '阅读文章',
        noArticles: '没有找到相关文章',
        tryAdjust: '尝试调整搜索词或选择其他分类',
        resetFilter: '重置筛选',
        categories: {
          all: '全部',
          inspiration: '励志故事',
          technical: '技术对比',
          tutorial: '使用教程',
          values: '价值理念',
          success: '成功案例',
          creation: '创作',
          memes: '表情包',
          editing: 'P图',
          comparison: '对比',
          beginners: '新手指南',
          tips: '技巧',
          philosophy: '哲学',
          happiness: '快乐',
          freedom: '自由',
          viral: '病毒传播',
          popular: '爆款'
        },
        posts: {
          sybauStory: {
            title: '🚀 Sybau Guy的逆袭之路：从废柴到表情包之王',
            excerpt: '一个普通人如何通过AI创意技术从底层崛起，成为全网最受欢迎的创意内容创作者。这是一个关于坚持、创新和永不放弃的励志故事。'
          },
          comparison: {
            title: '🎭 Sybau vs 传统P图：AI时代的创作革命',
            excerpt: '为什么Sybau AI技术能够完胜传统P图软件？看看这些震撼的对比案例，了解AI创作的真正威力！'
          },
          tutorial: {
            title: '🎪 5分钟掌握Sybau Picture：从新手到高手',
            excerpt: '零基础也能成为表情包大师！详细的步骤教程，让你快速掌握Sybau Picture的所有功能，创作出令人惊艳的作品。'
          },
          philosophy: {
            title: '🌈 Sybau的哲学：用AI传递快乐与自由',
            excerpt: '深入了解Sybau背后的价值观和哲学理念。探索如何通过AI技术传递正能量，让每个人都能自由表达创意。'
          },
          successCases: {
            title: '🏆 Sybau成功案例：这些作品是如何走红的',
            excerpt: '分析最成功的Sybau创作案例，揭秘病毒式传播的秘密。学习如何创作出10万+点赞的爆款内容。'
          }
        },
        cta: {
          title: '受到启发了吗？',
          description: '看完这些励志故事和成功案例，是时候开始你自己的创作之旅了！',
          startCreating: '立即开始创作',
          shareStory: '分享你的故事'
        }
      },
      gallery: {
        title: '🎨 创意作品画廊',
        subtitle: '欣赏AI创作的神奇效果，感受从平凡到惊艳的创意变化',
        searchPlaceholder: '搜索创意作品...',
        tabs: {
          featured: '精选对比案例',
          comparisons: '对比案例',
          userWorks: '用户作品'
        },
        stats: {
          creations: '创作总数',
          users: '活跃用户',
          satisfaction: '满意度',
          service: '在线服务'
        },
        categories: {
          all: '全部',
          daily: '日常生活',
          work: '职场生活',
          study: '学习生活',
          pets: '宠物萌宠',
          food: '美食生活',
          travel: '旅游风景',
          sports: '运动健身'
        },
        comparisonCases: [
          {
            title: '办公室摸鱼 vs AI改造',
            description: '平凡的办公室场景经过AI改造变成搞笑表情包',
            category: '日常生活'
          },
          {
            title: '宠物萌照 vs 搞笑改造',
            description: '可爱的宠物照片变身为病毒式传播的搞笑内容',
            category: '宠物萌宠'
          },
          {
            title: '美食拍照 vs 搞怪风格',
            description: '普通的美食照片转换为充满喜感的Sybau风格',
            category: '美食生活'
          },
          {
            title: '运动健身 vs 励志改造',
            description: '健身照片变身为激励人心的搞笑表情包',
            category: '运动健身'
          },
          {
            title: '旅游风景 vs 搞怪处理',
            description: '普通的旅游照片经过AI处理变成有趣的创意作品',
            category: '旅游风景'
          },
          {
            title: '学习时光 vs 搞笑转换',
            description: '枯燥的学习场景变成让人会心一笑的表情包',
            category: '学习生活'
          }
        ],
        userWorks: [
          {
            title: '周一早晨的我',
            author: '小明同学',
            category: '日常吐槽'
          },
          {
            title: '减肥第一天',
            author: '健身达人',
            category: '励志搞笑'
          },
          {
            title: '考试前的状态',
            author: '学霸小李',
            category: '学习生活'
          },
          {
            title: '加班到深夜',
            author: '程序员小王',
            category: '职场生活'
          },
          {
            title: '周末在家躺尸',
            author: '懒癌患者',
            category: '休闲生活'
          },
          {
            title: '看到账单的我',
            author: '月光族',
            category: '生活感悟'
          }
        ]
      },
      about: {
        title: '关于Sybau Picture',
        subtitle: '通过AI赋能创意',
        description: '我们的使命是通过让每个人都能使用专业品质的AI图像生成技术，让表情包创作民主化。',
        backToHome: '返回首页',
        tryGenerator: '试用生成器',
        stats: {
          memesCreated: '已创建表情包',
          activeUsers: '活跃用户',
          countriesServed: '服务国家',
          uptime: '运行时间'
        },
        mission: {
          title: '我们的使命',
          description: '打破想象力与创作之间的障碍。我们相信每个人都有创作内容的潜力，这些内容能够引起共鸣、娱乐大众并连接不同文化的人们。'
        },
        vision: {
          title: '我们的愿景',
          description: '一个创意无限的世界。我们设想一个AI增强而非取代人类创意的未来。'
        },
        values: {
          title: '我们的价值观',
          subtitle: '指导我们每一个决策和功能开发的原则。',
          innovation: {
            title: '创新至上',
            description: '我们推动AI技术的边界，让每个人都能获得创意工具。'
          },
          community: {
            title: '社区驱动',
            description: '用户是我们所做一切的核心。我们为创作者而构建，由创作者构建。'
          },
          privacy: {
            title: '注重隐私',
            description: '您的数据属于您。我们相信透明度和用户对个人信息的控制。'
          },
          global: {
            title: '全球包容',
            description: '表情包超越边界。我们正在构建一个庆祝所有文化和语言的平台。'
          }
        },
        team: {
          title: '认识我们的团队',
          subtitle: 'Sybau Picture背后充满激情的个人'
        },
        journey: {
          title: '我们的历程',
          subtitle: '从想法到全球平台'
        }
      },
      generator: {
        title: 'AI表情包生成器',
        subtitle: '将您的照片转换为病毒式Sybau表情包',
        backToHome: '返回首页',
        upload: {
          title: '上传您的照片',
          description: '拖拽您的图片到这里或点击浏览',
          supportedFormats: '支持JPG、PNG、WEBP格式，最大5MB',
          dragActive: '在此放下您的图片',
          selectFile: '选择文件',
          or: '或'
        },
        settings: {
          title: '风格设置',
          style: '风格',
          intensity: '强度',
          styles: {
            classic: '经典',
            exaggerated: '夸张',
            minimal: '简约'
          }
        },
        process: {
          title: '生成',
          processing: '处理中...',
          generate: '生成表情包',
          progress: '进度'
        },
        result: {
          title: '您的表情包已完成！',
          processingTime: '处理时间',
          seconds: '秒',
          download: '下载',
          share: '分享',
          createAnother: '创建另一个',
          copySuccess: '链接已复制到剪贴板！'
        },
        errors: {
          invalidFileType: '请上传有效的图片文件（JPG、PNG、WEBP）',
          fileTooLarge: '文件大小必须小于5MB',
          processingFailed: '处理失败',
          somethingWrong: '出现了一些问题'
        }
      },
      footer: {
        description: '全球首个专注于Sybau风格的AI创意图片生成平台。让每个人都能轻松创作出病毒式传播的创意图片。',
        product: {
          title: '产品',
          generator: 'AI生成器',
          gallery: '作品画廊',
          blog: '博客文章',
          about: '关于我们'
        },
        resources: {
          title: '资源',
          help: '使用教程',
          updates: '最新更新',
          api: 'API文档',
          developers: '开发者'
        },
        company: {
          title: '公司',
          privacy: '隐私政策',
          terms: '服务条款',
          contact: '联系我们',
          careers: '加入我们'
        },
        support: {
          title: '支持',
          help: '帮助中心',
          community: '社区论坛',
          feedback: '反馈建议',
          technical: '技术支持'
        },
        newsletter: {
          title: '订阅更新',
          description: '获取最新功能更新和创作灵感',
          placeholder: '输入您的邮箱'
        },
        privacy: '隐私政策',
        terms: '服务条款',
        language: '中文',
        copyright: '© 2024 Sybau Picture. 保留所有权利。',
        madeWith: '由'
      }
    }
  }
}

// 数据库相关的翻译函数已移动到 lib/i18n-server.ts
// 这个文件只保留客户端安全的工具函数和备用翻译数据

// 浏览器语言检测
export function detectBrowserLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE

  const browserLang = navigator.language.toLowerCase()

  // 精确匹配
  if (isValidLanguage(browserLang)) {
    return browserLang
  }

  // 语言代码匹配 (如 'en-US' -> 'en')
  const langCode = browserLang.split('-')[0]
  if (isValidLanguage(langCode)) {
    return langCode
  }

  return DEFAULT_LANGUAGE
}

// 生成语言切换URL
export function generateLanguageUrl(currentPath: string, targetLang: SupportedLanguage) {
  // 移除当前语言前缀（如果存在）
  let pathWithoutLang = currentPath
  const segments = currentPath.split('/').filter(Boolean)

  if (segments.length > 0 && isValidLanguage(segments[0])) {
    pathWithoutLang = '/' + segments.slice(1).join('/')
    if (pathWithoutLang === '/') pathWithoutLang = '/'
  }

  // 如果是默认语言（英语），不添加前缀
  if (targetLang === DEFAULT_LANGUAGE) {
    return pathWithoutLang
  }

  // 添加新的语言前缀
  if (pathWithoutLang === '/') {
    return `/${targetLang}`
  }
  return `/${targetLang}${pathWithoutLang}`
}

// 从URL中提取语言
export function extractLanguageFromPath(path: string): {
  language: SupportedLanguage
  pathWithoutLang: string
} {
  const pathSegments = path.split('/').filter(Boolean)
  const firstSegment = pathSegments[0]

  if (isValidLanguage(firstSegment)) {
    return {
      language: firstSegment,
      pathWithoutLang: '/' + pathSegments.slice(1).join('/')
    }
  }

  return {
    language: DEFAULT_LANGUAGE,
    pathWithoutLang: path
  }
}

// 添加工具函数来生成多语言链接
export function generateLocalizedLink(targetPath: string, currentPath: string): string {
  const { language } = extractLanguageFromPath(currentPath)

  // 如果是默认语言（英文），直接返回路径
  if (language === DEFAULT_LANGUAGE) {
    return targetPath
  }

  // 对于其他语言，添加语言前缀
  return `/${language}${targetPath}`
}

// 从当前路径获取语言代码
export function getCurrentLanguageFromPath(path: string): SupportedLanguage {
  const { language } = extractLanguageFromPath(path)
  return language
}
