import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    nextauth_url: process.env.NEXTAUTH_URL,
    google_client_id: process.env.GOOGLE_CLIENT_ID,
    has_google_secret: !!process.env.GOOGLE_CLIENT_SECRET,
    expected_callback_url: `${process.env.NEXTAUTH_URL}/api/auth/callback/google`,
    expected_signin_url: `${process.env.NEXTAUTH_URL}/api/auth/signin/google`,
    environment: process.env.NODE_ENV,
    vercel_env: process.env.VERCEL_ENV
  })
}