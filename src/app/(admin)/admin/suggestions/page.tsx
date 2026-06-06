import { createClient } from '@/lib/supabase/server'
import { SuggestionsQueue } from '@/components/admin/SuggestionsQueue'

export const metadata = { title: 'Suggestions — Admin' }

export default async function SuggestionsPage() {
  const supabase = createClient()
  const { data: suggestions } = await supabase
    .from('preregistrations')
    .select('*')
    .eq('type', 'suggest')
    .order('created_at', { ascending: false })

  return <SuggestionsQueue suggestions={suggestions ?? []} />
}
