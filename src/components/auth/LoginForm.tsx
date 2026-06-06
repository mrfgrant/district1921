'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/dashboard'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    // Pass next param through the callback so owner lands on onboarding after login
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/verify')
    }
  }

  const isOwnerFlow = next === '/onboarding'

  return (
    <div className="w-full max-w-sm mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="font-display text-4xl text-[var(--color-gold)] mb-2">District 1921</h1>
        {isOwnerFlow ? (
          <>
            <p className="text-[var(--color-text)] font-semibold mb-1">List your business</p>
            <p className="text-[var(--color-text-secondary)] text-sm">Enter your email to create your account — no password needed.</p>
          </>
        ) : (
          <p className="text-[var(--color-text-secondary)] text-sm">Sign in with your email — no password needed.</p>
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm text-[var(--color-text-secondary)] mb-1">
            Email address
          </label>
          <input
            id="email" type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            required placeholder="you@example.com"
            className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
          />
        </div>
        {error && <p className="text-[var(--color-error)] text-sm">{error}</p>}
        <button type="submit" disabled={loading || !email}
          className="w-full py-3 bg-[var(--color-gold)] text-[var(--color-midnight)] rounded font-semibold hover:bg-[var(--color-gold-light)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? 'Sending…' : isOwnerFlow ? 'Send My Sign-In Link' : 'Send Magic Link'}
        </button>
      </form>
      {isOwnerFlow && (
        <p className="text-center text-xs text-[var(--color-muted)] mt-6">
          Already have an account?{' '}
          <a href="/login" className="text-[var(--color-gold)] underline underline-offset-2">Sign in here</a>
        </p>
      )}
    </div>
  )
}
