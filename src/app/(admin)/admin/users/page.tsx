import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Users — Admin' }

export default async function AdminUsersPage() {
  const supabase = createClient()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, role, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="max-w-5xl">
      <h1 className="font-display text-2xl text-[var(--color-gold)] mb-6">Users</h1>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              {['Email', 'Role', 'Joined'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(profiles ?? []).map(p => (
              <tr key={p.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-midnight)]">
                <td className="px-5 py-3 text-[var(--color-text)]">{p.email}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    p.role === 'admin' ? 'bg-[#c9a84c]/20 text-[#c9a84c]' :
                    p.role === 'paid_owner' ? 'bg-green-900/30 text-green-400' :
                    p.role === 'free_owner' ? 'bg-blue-900/30 text-blue-400' :
                    'bg-[var(--color-border)] text-[var(--color-text-secondary)]'
                  }`}>
                    {p.role}
                  </span>
                </td>
                <td className="px-5 py-3 text-[var(--color-text-secondary)]">
                  {new Date(p.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
