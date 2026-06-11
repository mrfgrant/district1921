import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const OUTSCRAPER_KEY = process.env.OUTSCRAPER_API_KEY ?? ''

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
  'african hair braiding':'beauty-wellness','hair braiding salon':'beauty-wellness',
  'natural hair':'beauty-wellness','lash studio':'beauty-wellness',
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

function mapCategory(categoryStr: string | null | undefined): string {
  if (!categoryStr) return 'professional-services'
  const lower = categoryStr.toLowerCase().trim()
  if (CATEGORY_MAP[lower]) return CATEGORY_MAP[lower]
  for (const [key, val] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(key) || key.includes(lower)) return val
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

const NOT_STATES    = new Set(['IN','OR','ME','OK','AS','IS','IT','AT','BE','DO','GO','HI','IF','MY','NO','OF','OH','ON','SO','TO','UP','US','WE'])
const STATE_ABBREVS = new Set(['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'])

// Single job endpoint — one query per call, returns rows as JSON
// Called repeatedly by the client to drive the batch loop
export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  if (!OUTSCRAPER_KEY) return NextResponse.json({ error: 'OUTSCRAPER_API_KEY not configured' }, { status: 500 })

  const { query, city, state, maxResults = 100 } = await req.json() as {
    query: string; city: string; state: string; maxResults?: number
  }

  if (!query?.trim()) return NextResponse.json({ error: 'Query required' }, { status: 400 })

  const params = new URLSearchParams({
    query,
    limit: String(maxResults),
    async: 'false',
    language: 'en',
  })

  try {
    const res = await fetch(
      `https://api.app.outscraper.com/maps/search-v3?${params.toString()}`,
      {
        method: 'GET',
        headers: { 'X-API-KEY': OUTSCRAPER_KEY },
        signal: AbortSignal.timeout(55_000),
      }
    )

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: `Outscraper ${res.status}: ${text.slice(0,200)}` }, { status: 500 })
    }

    const json = await res.json()
    const places: any[] = (json.data ?? []).flat()

    const rows = places
      .filter(p => p.name && (p.city || city))
      .map(p => {
        const stateAbbrev = abbrevState(p.state) ?? (p.state?.length === 2 ? p.state.toUpperCase() : state)
        return {
          name:      (p.name ?? '').trim(),
          category:  mapCategory(p.type),
          address:   p.full_address ?? p.street ?? '',
          city:      p.city ?? city,
          state:     stateAbbrev || state,
          zip:       p.postal_code ?? p.zip ?? '',
          phone:     normalizePhone(p.phone) ?? '',
          website:   p.site ?? p.website ?? '',
          lat:       p.latitude ?? '',
          lng:       p.longitude ?? '',
          source:    'google_maps',
          geo_match: (stateAbbrev || state) === state ? 'yes' : 'no',
        }
      })

    return NextResponse.json({ rows, found: rows.length })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Scrape failed' }, { status: 500 })
  }
}
