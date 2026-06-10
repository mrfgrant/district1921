import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function DELETE(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { importedAt } = await req.json() as { importedAt: string }
  if (!importedAt) return NextResponse.json({ error: 'Missing importedAt' }, { status: 400 })

  const from = new Date(importedAt)
  const to   = new Date(from.getTime() + 60_000)

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('businesses')
    .delete()
    .is('owner_id', null)
    .gte('created_at', from.toISOString())
    .lte('created_at', to.toISOString())
    .select('id, name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deleted: data?.length ?? 0 })
}
