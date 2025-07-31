import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FLUX Pro AI Pricing - Sybau Picture Plans',
  description: 'Choose the perfect plan for your AI picture generation needs. Free, Standard ($9/mo), and Professional ($19/mo) plans available. FLUX Pro engine, commercial quality, 15s generation.',
  keywords: ['FLUX Pro pricing', 'AI picture generator plans', 'Sybau pricing', 'AI image editor subscription', 'professional AI editing plans'],
  openGraph: {
    title: 'FLUX Pro AI Pricing - Sybau Picture Plans',
    description: 'Choose the perfect plan for your AI picture generation needs. Free, Standard, and Professional plans with FLUX Pro engine.',
    url: 'https://sybaupicture.com/pricing',
  },
  alternates: {
    canonical: '/pricing',
    languages: {
      'en-US': '/pricing',
      'zh-CN': '/zh/pricing',
    },
  },
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}