import type { Metadata } from 'next'
import AssetsPage from '@/app/profile/assets/page'

export const metadata: Metadata = {
  title: '我的资产 - Sybau Picture',
  description: '管理和查看您生成的所有AI图片。跟踪统计数据、下载历史并整理您的创意资产。',
  robots: {
    index: false, // 私人页面，需要登录，不应该被搜索引擎索引
    follow: false,
  },
  openGraph: {
    title: '我的资产 - Sybau Picture',
    description: '管理和查看您生成的所有AI图片。跟踪统计数据、下载历史并整理您的创意资产。',
    url: 'https://sybaupicture.com/zh/profile/assets',
    locale: 'zh_CN',
  },
}

export default AssetsPage