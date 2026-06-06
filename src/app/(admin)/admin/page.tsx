export const metadata = { title: 'Admin' }

export default function AdminPage() {
  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--color-gold)] mb-8">
        Admin Panel
      </h1>
      <p className="text-[var(--color-text-secondary)]">
        Listings queue, shield review, reports, and spotlight management.
      </p>
    </div>
  )
}
