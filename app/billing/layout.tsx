import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: {
    index: false, // 私人页面，需要登录，不应该被搜索引擎索引
    follow: false,
  },
}

export default function BillingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}