import { Metadata } from 'next'
import ZHHelpPageClient from './ZHHelpPageClient'

export const metadata: Metadata = {
  title: '帮助支持 - Sybau Picture | AI图片生成器常见问题与模板指南',
  description: '找到关于Sybau Picture AI图片生成器的完整答案。了解模板功能、我的资产、双重创作模式、价格套餐、故障排除和高级功能。',
  keywords: ['帮助', '支持', '常见问题', 'AI图片生成器', 'Sybau Picture', '模板功能', '我的资产', '文生图', '图生图', '故障排除', '指南', '教程', '去水印', '身材优化', '智能修图'],
  openGraph: {
    title: '帮助支持 - Sybau Picture AI图片生成器',
    description: 'Sybau Picture完整FAQ指南：模板功能、我的资产、双重创作模式、价格套餐和故障排除。掌握AI图片生成技巧。',
    url: 'https://sybaupicture.com/zh/help',
    type: 'website',
    images: [{
      url: 'https://sybaupicture.com/images/help-zh-og.jpg',
      width: 1200,
      height: 630,
      alt: 'Sybau Picture 帮助支持指南',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '帮助支持 - Sybau Picture',
    description: '完整FAQ指南：模板功能、我的资产、双重模式和AI图片生成高级功能。',
    images: ['https://sybaupicture.com/images/help-zh-twitter.jpg'],
  },
  alternates: {
    canonical: '/zh/help',
    languages: {
      'en-US': '/help',
      'zh-CN': '/zh/help',
    },
  },
}

export default function ZHHelpPage() {
  return (
    <>
      {/* 更新的中文FAQ结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "inLanguage": "zh-CN",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "如何开始使用Sybau Picture？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "我们的AI融合了Z时代文化和Sybau理念 - Stay Young, Beautiful and Unique。选择文生图模式（输入文字描述）或图生图模式（上传并转换），选择您喜欢的风格，几秒钟内获得专业效果。"
                }
              },
              {
                "@type": "Question",
                "name": "模板是什么，如何使用？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "模板是针对特定任务的预配置AI设置，如去水印、身材优化或背景替换。点击模板库按钮浏览14个专业模板，分为3大类：生活增强、商业创作、创意转换。"
                }
              },
              {
                "@type": "Question",
                "name": "文生图和图生图模式有什么区别？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "文生图根据您的文字描述创建全新图片。图生图则是对您上传的照片进行AI转换 - 非常适合编辑、风格变换或增强效果。两种模式都支持我们的4种专业风格。"
                }
              },
              {
                "@type": "Question",
                "name": "如何管理我生成的图片？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "在个人资料中访问\"我的资产\"查看所有生成的图片，按日期整理。您可以查看、下载或删除个人画廊中的图片。生成时图片会自动保存。"
                }
              },
              {
                "@type": "Question",
                "name": "支持哪些图片格式？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "我们支持JPG、PNG和WebP格式。图片大小应控制在5MB以内，分辨率在512x512到2048x2048像素之间效果最佳。"
                }
              },
              {
                "@type": "Question",
                "name": "当前的使用限制是什么？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "免费用户：每月3张图片。标准用户：每月60张图片。专业用户：每月180张图片，享受优先处理。所有套餐都包含无限存储且无水印。"
                }
              },
              {
                "@type": "Question",
                "name": "免费用户可以使用哪些模板？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "🎉 重大升级：所有14个专业模板现已对全体用户免费开放！涵盖3大分类：🎨生活增强（智能去水印、身材优化、路人移除）、🛍️商业创作（电商展示、背景替换、元素融合）、🎭创意转换（风格转换、文字编辑、细节修改）。无任何限制，畅享FLUX Pro驱动的完整模板库！"
                }
              },
              {
                "@type": "Question",
                "name": "模板系统有什么新功能升级？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "🚀 重大功能升级：我们已完全开放模板库！所有14个由FLUX Pro引擎驱动的专业模板现已对所有人免费！体验生活增强模板（智能编辑）、商业创作模板（电商专用）、创意转换模板（艺术变换）。每个模板都包含优化参数，实现15秒专业效果。无任何限制 - 创造无限专业内容！"
                }
              },
              {
                "@type": "Question",
                "name": "有哪些AI风格可以选择？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "我们提供4种专业AI风格：🎨经典风格 - 传统均衡美学，适合日常使用；💼专业风格 - 精致商务风格，适合商业项目；🌟表现力风格 - 大胆戏剧化效果（标准套餐+）；🎭创意风格 - 富有想象力的艺术表达。每种风格都针对不同用途和创意需求进行了优化。"
                }
              },
              {
                "@type": "Question",
                "name": "可以商业使用生成的图片吗？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "可以！您拥有所有生成图片的完整商业使用权。可用于商业、社交媒体、营销或任何商业目的。只需确保您上传的原始图片没有版权问题。"
                }
              },
              {
                "@type": "Question",
                "name": "生成的图片会有水印吗？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "不会！包括免费套餐在内的所有套餐都生成无水印图片。您将获得干净、专业的结果，适用于任何用途。"
                }
              },
              {
                "@type": "Question",
                "name": "我的图片会保存多长时间？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "您生成的图片会永久保存在账户中，除非您主动删除。您拥有无限存储空间，可随时从\"我的资产\"访问所有创作。"
                }
              },
              {
                "@type": "Question",
                "name": "我的数据安全和隐私吗？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "绝对安全。我们使用企业级加密，不会永久存储上传的图片，除非您选择保存。生成的图片仅保存在您的个人画廊中。请查看我们的隐私政策了解完整详情。"
                }
              },
              {
                "@type": "Question",
                "name": "如何获得最佳模板使用效果？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "🎯 获得最佳模板效果的技巧：1）选择合适分类 - 生活增强用于照片编辑，商业创作用于商业用途，创意转换用于艺术效果；2）上传高质量原图（JPG/PNG，5MB以内）；3）模板自动应用FLUX Pro优化参数，确保最佳效果；4）搭配合适AI风格 - 商业项目用专业风格，艺术创作用创意风格；5）使用与模板用途匹配的具体提示词，提升生成精准度。"
                }
              }
            ]
          })
        }}
      />
      <ZHHelpPageClient />
    </>
  )
}
