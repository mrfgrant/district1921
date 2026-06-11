import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'moderator'].includes(profile.role)) {
    redirect('/')
  }

  return (
    <div className="d1921-admin-layout min-h-screen bg-[var(--color-midnight)]">
      <AdminSidebar role={profile.role} />
      <main className="d1921-admin-main flex-1 p-4 md:p-6 bg-[var(--color-midnight)] min-w-0">
        {children}
      </main>
      <style>{`
        .d1921-admin-layout {
          display: flex;
          flex-direction: column;
        }
        @media (min-width: 769px) {
          .d1921-admin-layout {
            flex-direction: row;
          }
        }
      `}</style>
    </div>
  )
}
