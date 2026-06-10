import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const APIFY_TOKEN = process.env.APIFY_API_TOKEN ?? ''
const ACTOR_ID    = 'compass/crawler-google-places'

const CATEGORY_MAP: Record<string, string> = {
  'soul food restaurant':'food-dining','restaurant':'food-dining','american restaurant':'food-dining',
  'southern restaurant':'food-dining','caribbean restaurant':'food-dining','african restaurant':'food-dining',
  'breakfast restaurant':'food-dining','seafood restaurant':'food-dining','bbq restaurant':'food-dining',
  'chicken restaurant':'food-dining','jamaican restaurant':'food-dining','bakery':'food-dining',
  'cafe':'food-dining','coffee shop':'food-dining','caterer':'food-dining','bar & grill':'food-dining',
  'bar':'food-dining','food':'food-dining','diner':'food-dining',
  'hair salon':'beauty-wellness','nail salon':'beauty-wellness','beauty salon':'beauty-wellness',
  'barber shop':'beauty-wellness','barbershop':'beauty-wellness','spa':'beauty-wellness',
  'massage therapist':'beauty-wellness','hair care':'beauty-wellness',
  'beauty supply store':'beauty-wellness','waxing hair removal':'beauty-wellness',
  'hair store':'beauty-wellness','hair extensions':'beauty-wellness','virgin hair':'beauty-wellness',
  'beauty store':'beauty-wellness','beauty market':'beauty-wellness','hair supply':'beauty-wellness',
  'african hair braiding':'beauty-wellness','hair braiding salon':'beauty-wellness',
  'natural hair':'beauty-wellness','lash studio':'beauty-wellness','eyelash salon':'beauty-wellness',
  'nail care':'beauty-wellness','nail spa':'beauty-wellness','manicure':'beauty-wellness',
  'pedicure':'beauty-wellness','cosmetics store':'beauty-wellness',
  'doctor':'health-medical','medical clinic':'health-medical','dentist':'health-medical',
  'dental clinic':'health-medical','pharmacy':'health-medical',
  'mental health service':'health-medical','physical therapist':'health-medical',
  'chiropractor':'health-medical','pediatric dentist':'health-medical',
  'lawyer':'legal-financial','law firm':'legal-financial','legal services':'legal-financial',
  'accountant':'legal-financial','tax preparation service':'legal-financial',
  'insurance agency':'legal-financial','financial planner':'legal-financial',
  'credit union':'legal-financial','bank':'legal-financial','mortgage broker':'legal-financial',
  'certified public accountant':'legal-financial','financial advisor':'legal-financial',
  'general contractor':'home-construction','roofing contractor':'home-construction',
  'plumber':'home-construction','electrician':'home-construction','hvac contractor':'home-construction',
  'landscaper':'home-construction','house painter':'home-construction',
  'flooring store':'home-construction','moving company':'home-construction',
  'cleaning service':'home-construction','handyman':'home-construction',
  'remodeling contractor':'home-construction','construction company':'home-construction',
  'auto repair shop':'automotive','car dealer':'automotive','auto parts store':'automotive',
  'car wash':'automotive','tire shop':'automotive','towing service':'automotive',
  'auto detailing service':'automotive','mechanic':'automotive',
  'child care agency':'education-childcare','day care center':'education-childcare',
  'preschool':'education-childcare','after school program':'education-childcare',
  'child care':'education-childcare','kindergarten':'education-childcare',
}

function mapCategory(categories: string[]): string {
  for (const cat of categories) {
    const lower = cat.toLowerCase().trim()
    if (CATEGORY_MAP[lower]) return CATEGORY_MAP[lower]
    for (const [key, val] of Object.entries(CATEGORY_MAP)) {
      if (lower.includes(key) || key.includes(lower)) return val
    }
  }
  return 'professional-services'
}

function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits[0] === '1') return `+${digits}`
  return phone
}

function abbrevState(name: string | null | undefined): string | null {
  if (!name) return null
  const map: Record<string, string> = {
    'Alabama':'AL','Alaska':'AK','Arizona':'AZ','Arkansas':'AR','California':'CA',
    'Colorado':'CO','Connecticut':'CT','Delaware':'DE','Florida':'FL','Georgia':'GA',
    'Hawaii':'HI','Idaho':'ID','Illinois':'IL','Indiana':'IN','Iowa':'IA','Kansas':'KS',
    'Kentucky':'KY','Louisiana':'LA','Maine':'ME','Maryland':'MD','Massachusetts':'MA',
    'Michigan':'MI','Minnesota':'MN','Mississippi':'MS','Missouri':'MO','Montana':'MT',
    'Nebraska':'NE','Nevada':'NV','New Hampshire':'NH','New Jersey':'NJ',
    'New Mexico':'NM','New York':'NY','North Carolina':'NC','North Dakota':'ND',
    'Ohio':'OH','Oklahoma':'OK','Oregon':'OR','Pennsylvania':'PA','Rhode Island':'RI',
    'South Carolina':'SC','South Dakota':'SD','Tennessee':'TN','Texas':'TX','Utah':'UT',
    'Vermont':'VT','Virginia':'VA','Washington':'WA','West Virginia':'WV',
    'Wisconsin':'WI','Wyoming':'WY','District of Columbia':'DC',
  }
  if (map[name]) return map[name]
  if (name.length === 2) return name.toUpperCase()
  return null
}

async function scrapeOne(query: string, maxResults: number): Promise<any[]> {
  const res = await fetch(
    `https://api.apify.com/v2/acts/${encodeURIComponent(ACTOR_ID)}/run-sync-get-dataset-items?token=${APIFY_TOKEN}&format=json&limit=${maxResults}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        searchStringsArray: [query],
        maxCrawledPlacesPerSearch: maxResults,
        includeOpeningHours: false,
        maxReviews: 0, maxImages: 0,
        exportPlaceUrls: false, includeHistogram: false,
        includePeopleAlsosearch: false, language: 'en',
      }),
      signal: AbortSignal.timeout(120_000),
    }
  )
  if (!res.ok) throw new Error(`Apify ${res.status}: ${(await res.text()).slice(0, 200)}`)
  return res.json()
}

function toRow(p: any, queryCity: string, queryState: string) {
  const stateAbbrev = abbrevState(p.state) ?? p.state ?? ''
  const city        = p.city ?? queryCity
  const state       = stateAbbrev || queryState
  return {
    name:     (p.title ?? '').trim(),
    category: mapCategory(p.categories ?? []),
    address:  p.street ?? '',
    city,
    state,
    zip:      p.postalCode ?? '',
    phone:    normalizePhone(p.phoneUnformatted ?? p.phone) ?? '',
    website:  p.website ?? '',
    lat:      p.location?.lat ?? '',
    lng:      p.location?.lng ?? '',
    source:   'google_maps',
    geo_match: stateAbbrev === queryState ? 'yes' : 'no',
  }
}

function toCSV(rows: ReturnType<typeof toRow>[]): string {
  const headers = ['name','category','address','city','state','zip','phone','website','lat','lng','source','geo_match']
  const escape  = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const lines   = [headers.join(','), ...rows.map(r => headers.map(h => escape((r as any)[h])).join(','))]
  return lines.join('\n')
}

// POST /api/admin/batch-scrape
// Body: { jobs: { query: string, city: string, state: string }[], maxResults: number }
// Streams NDJSON progress updates, ends with { done: true, csv: string }
export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  if (!APIFY_TOKEN) return NextResponse.json({ error: 'APIFY_API_TOKEN not configured' }, { status: 500 })

  const { jobs, maxResults = 100 } = await req.json() as {
    jobs: { query: string; city: string; state: string }[]
    maxResults: number
  }

  // Stream NDJSON progress
  const encoder = new TextEncoder()
  const stream  = new ReadableStream({
    async start(controller) {
      const send = (data: object) => controller.enqueue(encoder.encode(JSON.stringify(data) + '\n'))

      const allRows: ReturnType<typeof toRow>[] = []
      let completed = 0
      let totalFound = 0

      for (const job of jobs) {
        send({ type: 'progress', completed, total: jobs.length, query: job.query, status: 'running' })
        try {
          const places = await scrapeOne(job.query, maxResults)
          const rows   = places.filter(p => p.title && (p.city || job.city)).map(p => toRow(p, job.city, job.state))
          allRows.push(...rows)
          totalFound += rows.length
          completed++
          send({ type: 'progress', completed, total: jobs.length, query: job.query, status: 'done', found: rows.length, totalFound })
        } catch (e: any) {
          completed++
          send({ type: 'progress', completed, total: jobs.length, query: job.query, status: 'error', error: e.message })
        }
      }

      // Deduplicate by phone number (keep first occurrence)
      const seen  = new Set<string>()
      const deduped = allRows.filter(r => {
        const key = r.phone || `${r.name}|${r.city}|${r.state}`
        if (seen.has(key)) return false
        seen.add(key); return true
      })

      send({ type: 'done', totalRaw: allRows.length, totalDeduped: deduped.length, csv: toCSV(deduped) })
      controller.close()
    }
  })

  return new NextResponse(stream, {
    headers: { 'Content-Type': 'application/x-ndjson', 'Cache-Control': 'no-cache' }
  })
}
