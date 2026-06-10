import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const APIFY_TOKEN = process.env.APIFY_API_TOKEN ?? ''
const ACTOR_ID    = 'compass/crawler-google-places'

// Category mapping — same as import route
const CATEGORY_MAP: Record<string, string> = {
  'soul food restaurant':'food-dining','soul food':'food-dining','restaurant':'food-dining',
  'american restaurant':'food-dining','southern restaurant':'food-dining',
  'caribbean restaurant':'food-dining','african restaurant':'food-dining',
  'breakfast restaurant':'food-dining','brunch restaurant':'food-dining',
  'seafood restaurant':'food-dining','bbq restaurant':'food-dining',
  'chicken restaurant':'food-dining','pizza restaurant':'food-dining',
  'jamaican restaurant':'food-dining','bakery':'food-dining','cafe':'food-dining',
  'coffee shop':'food-dining','caterer':'food-dining','food':'food-dining',
  'bar & grill':'food-dining','bar':'food-dining',

  'hair salon':'beauty-wellness','nail salon':'beauty-wellness',
  'beauty salon':'beauty-wellness','barber shop':'beauty-wellness',
  'barbershop':'beauty-wellness','spa':'beauty-wellness',
  'massage therapist':'beauty-wellness','hair care':'beauty-wellness',
  'beauty supply store':'beauty-wellness','waxing hair removal':'beauty-wellness',
  'tanning salon':'beauty-wellness','tattoo shop':'beauty-wellness',

  'doctor':'health-medical','medical clinic':'health-medical',
  'dentist':'health-medical','dental clinic':'health-medical',
  'pharmacy':'health-medical','mental health service':'health-medical',
  'physical therapist':'health-medical','chiropractor':'health-medical',
  'hospital':'health-medical','urgent care center':'health-medical',

  'lawyer':'legal-financial','law firm':'legal-financial',
  'legal services':'legal-financial','accountant':'legal-financial',
  'tax preparation service':'legal-financial','insurance agency':'legal-financial',
  'financial planner':'legal-financial','credit union':'legal-financial',
  'bank':'legal-financial','mortgage broker':'legal-financial',
  'notary public':'legal-financial',

  'general contractor':'home-construction','roofing contractor':'home-construction',
  'plumber':'home-construction','electrician':'home-construction',
  'hvac contractor':'home-construction','landscaper':'home-construction',
  'house painter':'home-construction','flooring store':'home-construction',
  'moving company':'home-construction','cleaning service':'home-construction',
  'handyman':'home-construction','remodeling contractor':'home-construction',

  'auto repair shop':'automotive','car dealer':'automotive',
  'auto parts store':'automotive','car wash':'automotive',
  'tire shop':'automotive','towing service':'automotive',
  'auto detailing service':'automotive',

  'marketing agency':'professional-services','photographer':'professional-services',
  'videographer':'professional-services','graphic designer':'professional-services',
  'printing service':'professional-services','staffing agency':'professional-services',
  'event planner':'professional-services','security service':'professional-services',
  'consultant':'professional-services','business management consultant':'professional-services',

  'school':'education-childcare','tutoring service':'education-childcare',
  'child care agency':'education-childcare','preschool':'education-childcare',
  'day care center':'education-childcare','after school program':'education-childcare',

  'clothing store':'retail-products','boutique':'retail-products',
  'book store':'retail-products','gift shop':'retail-products',
  'grocery store':'retail-products','florist':'retail-products',
  'jewelry store':'retail-products','shoe store':'retail-products',

  'church':'faith-community','religious organization':'faith-community',

  'non-profit organization':'nonprofit','community center':'nonprofit',
  'charity':'nonprofit','foundation':'nonprofit',

  'real estate agency':'real-estate','real estate agent':'real-estate',
  'property management company':'real-estate',

  'gym':'entertainment-travel','fitness center':'entertainment-travel',
  'yoga studio':'entertainment-travel','dance school':'entertainment-travel',
  'art gallery':'entertainment-travel','music venue':'entertainment-travel',
  'hotel':'entertainment-travel','travel agency':'entertainment-travel',
  'night club':'entertainment-travel','lounge':'entertainment-travel',

  'software company':'programming-services','web designer':'internet-services',
  'it service':'information-technology','computer repair service':'information-technology',

  'veteran services organization':'veteran-services',
}

function mapCategory(categories: string[]): string {
  for (const cat of categories) {
    const lower = cat.toLowerCase().trim()
    if (CATEGORY_MAP[lower]) return CATEGORY_MAP[lower]
    // partial match
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

export async function POST(req: NextRequest) {
  // Auth check
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  if (!APIFY_TOKEN) return NextResponse.json({ error: 'APIFY_API_TOKEN not configured' }, { status: 500 })

  const { query, maxResults = 20 } = await req.json() as { query: string; maxResults?: number }
  if (!query?.trim()) return NextResponse.json({ error: 'Query required' }, { status: 400 })

  // Run Apify actor synchronously (waits for completion)
  const runRes = await fetch(
    `https://api.apify.com/v2/acts/${encodeURIComponent(ACTOR_ID)}/run-sync-get-dataset-items?token=${APIFY_TOKEN}&format=json&limit=${maxResults}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        searchStringsArray: [query],
        maxCrawledPlacesPerSearch: maxResults,
        includeOpeningHours: true,
        maxReviews: 0,
        maxImages: 0,
        exportPlaceUrls: false,
        includeHistogram: false,
        includePeopleAlsosearch: false,
        language: 'en',
      }),
      signal: AbortSignal.timeout(120_000), // 2 min timeout
    }
  )

  if (!runRes.ok) {
    const text = await runRes.text()
    return NextResponse.json({ error: `Apify error: ${runRes.status} ${text.slice(0, 200)}` }, { status: 500 })
  }

  const places: any[] = await runRes.json()

  // Extract the state abbreviation from the query for geo-filtering
  const queryStateMatch = query.match(/\b([A-Z]{2})\b(?=[^A-Z]|$)/) ??
                          query.match(/in\s+\w+[,\s]+(\w+)\s*$/i)
  const queryWords     = query.toLowerCase().split(/\s+/)
  const STATE_ABBREVS  = new Set(['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'])
  const queryState     = queryWords.find(w => STATE_ABBREVS.has(w.toUpperCase()))?.toUpperCase() ?? null

  // Transform Apify results into PreviewRow format
  const rows = places
    .filter(p => p.title && p.city)
    .map((p, i) => {
      const stateAbbrev = abbrevState(p.state) ?? p.state ?? ''
      const geoMismatch = queryState && stateAbbrev && stateAbbrev !== queryState
      return {
        _row: i + 1,
        _categoryWarning: geoMismatch
          ? `Location mismatch: result is in ${stateAbbrev}, query was for ${queryState}`
          : null,
        name:        p.title?.trim() ?? '',
        category:    mapCategory(p.categories ?? []),
        address:     p.street ?? null,
        city:        p.city ?? '',
        state:       stateAbbrev,
        zip:         p.postalCode ?? null,
        phone:       normalizePhone(p.phoneUnformatted ?? p.phone),
        website:     p.website ?? null,
        email:       null,
        description: null,
        lat:         p.location?.lat ?? null,
        lng:         p.location?.lng ?? null,
        _hours:      p.openingHours ?? null,
      }
    })

  return NextResponse.json({
    totalRows:   rows.length,
    validRows:   rows.length,
    skippedRows: places.length - rows.length,
    errors:      [],
    preview:     rows.slice(0, 200),
    allRows:     rows,
    query,
  })
}

// Full state name → abbreviation
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
  return map[name] ?? name.slice(0, 2).toUpperCase()
}
