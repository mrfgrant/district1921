import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return (
    <div className="d1921-dash-layout min-h-screen bg-[var(--color-midnight)]">
      <DashboardSidebar />
      <main className="d1921-dash-main flex-1 p-4 md:p-6 bg-[var(--color-midnight)] min-w-0">
        {children}
      </main>
      <style>{`
        .d1921-dash-layout {
          display: flex;
          flex-direction: column;
        }
        @media (min-width: 769px) {
          .d1921-dash-layout {
            flex-direction: row;
          }
        }
      `}</style>
    </div>
  )
}
