import { createClient } from '@/lib/supabase/server'
import { Suspense } from 'react'
import { ComingSoon } from '@/components/landing/ComingSoon'
import { AuthCodeHandler } from '@/components/landing/AuthCodeHandler'

export const metadata = {
  title: 'District 1921 — Coming Soon',
  description: 'A nationwide community business directory. Built for us, by us. Pre-registration open now.',
}

export default function HomePage() {
  return (
    <>
      {/* Silently handles ?code= if Supabase redirects here instead of /auth/callback */}
      <Suspense>
        <AuthCodeHandler />
      </Suspense>
      <ComingSoon />
    </>
  )
}
