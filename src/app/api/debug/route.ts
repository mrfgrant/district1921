import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    has_service_role: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    service_role_length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length ?? 0,
    has_anon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    has_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    has_resend: !!process.env.RESEND_API_KEY,
    node_env: process.env.NODE_ENV,
  })
}
