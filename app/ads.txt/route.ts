import { NextResponse } from 'next/server'

export async function GET() {
  const adsContent = 'google.com, pub-1000714999006921, DIRECT, f08c47fec0942fa0'
  
  return new NextResponse(adsContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400', // 24小时缓存
    },
  })
} 