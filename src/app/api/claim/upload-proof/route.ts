import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData   = await req.formData()
  const file       = formData.get('file') as File
  const businessId = formData.get('businessId') as string

  if (!file || !businessId) return NextResponse.json({ error: 'Missing file or businessId' }, { status: 400 })

  const ext   = file.name.split('.').pop() ?? 'jpg'
  const path  = `claim-proofs/${businessId}/${user.id}-${Date.now()}.${ext}`
  const bytes = await file.arrayBuffer()

  const admin = createAdminClient()
  const { error } = await admin.storage.from('business-assets').upload(path, bytes, { contentType: file.type, upsert: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data } = admin.storage.from('business-assets').getPublicUrl(path)
  return NextResponse.json({ url: data.publicUrl })
}
