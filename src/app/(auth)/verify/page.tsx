export const metadata = { title: 'Check Your Email' }

export default function VerifyPage() {
  return (
    <div className="text-center max-w-md mx-auto px-4">
      <h1 className="font-display text-3xl text-[var(--color-gold)] mb-4">
        Check your inbox
      </h1>
      <p className="text-[var(--color-text-secondary)]">
        We sent you a magic link. Click it to sign in — no password needed.
      </p>
    </div>
  )
}
