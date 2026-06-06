'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function AuthCodeHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const code = searchParams.get('code')
    if (!code) return

    async function exchange() {
      const supabase = createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code!)
      if (!error) {
        // Check where to send them
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: business } = await supabase
            .from('businesses')
            .select('id')
            .eq('owner_id', user.id)
            .single()
          router.replace(business ? '/dashboard' : '/onboarding')
        }
      } else {
        console.error('Code exchange error:', error)
        router.replace('/login?error=auth')
      }
    }

    exchange()
  }, [searchParams, router])

  return null
}
