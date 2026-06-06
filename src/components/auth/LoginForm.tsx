'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/verify')
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="font-display text-4xl text-[var(--color-gold)] mb-2">District 1921</h1>
        <p className="text-[var(--color-text-secondary)] text-sm">Sign in with your email — no password needed.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm text-[var(--color-text-secondary)] mb-1">Email address</label>
          <input
            id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
            required placeholder="you@example.com"
            className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
          />
        </div>
        {error && <p className="text-[var(--color-error)] text-sm">{error}</p>}
        <button type="submit" disabled={loading || !email}
          className="w-full py-3 bg-[var(--color-gold)] text-[var(--color-midnight)] rounded font-semibold hover:bg-[var(--color-gold-light)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? 'Sending…' : 'Send Magic Link'}
        </button>
      </form>
    </div>
  )
}
