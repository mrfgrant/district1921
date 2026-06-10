import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// ── Category mapping ──────────────────────────────────────────────────────────
const CATEGORY_MAP: Record<string, string> = {
  // Food & Dining
  restaurant:'food-dining', food:'food-dining', dining:'food-dining',
  cafe:'food-dining', coffee:'food-dining', bakery:'food-dining',
  catering:'food-dining', bar:'food-dining', diner:'food-dining',
  'soul food':'food-dining', bbq:'food-dining', pizza:'food-dining',
  seafood:'food-dining', breakfast:'food-dining', brunch:'food-dining',
  'fast food':'food-dining', 'food truck':'food-dining', wings:'food-dining',
  // Beauty & Wellness
  beauty:'beauty-wellness', salon:'beauty-wellness', barber:'beauty-wellness',
  barbershop:'beauty-wellness', spa:'beauty-wellness', nail:'beauty-wellness',
  hair:'beauty-wellness', locs:'beauty-wellness', braids:'beauty-wellness',
  massage:'beauty-wellness', wellness:'beauty-wellness', skincare:'beauty-wellness',
  cosmetics:'beauty-wellness', lashes:'beauty-wellness', esthetics:'beauty-wellness',
  // Health & Medical
  medical:'health-medical', health:'health-medical', doctor:'health-medical',
  dentist:'health-medical', dental:'health-medical', clinic:'health-medical',
  pharmacy:'health-medical', 'mental health':'health-medical',
  therapy:'health-medical', therapist:'health-medical',
  chiropractor:'health-medical', optometry:'health-medical', nursing:'health-medical',
  // Legal & Financial
  attorney:'legal-financial', lawyer:'legal-financial', law:'legal-financial',
  legal:'legal-financial', financial:'legal-financial', finance:'legal-financial',
  accounting:'legal-financial', accountant:'legal-financial', tax:'legal-financial',
  insurance:'legal-financial', investment:'legal-financial',
  'credit union':'legal-financial', bank:'legal-financial',
  mortgage:'legal-financial', notary:'legal-financial', cpa:'legal-financial',
  // Home & Construction
  construction:'home-construction', contractor:'home-construction',
  plumber:'home-construction', plumbing:'home-construction',
  electrician:'home-construction', electrical:'home-construction',
  hvac:'home-construction', roofing:'home-construction',
  landscaping:'home-construction', cleaning:'home-construction',
  painting:'home-construction', flooring:'home-construction',
  handyman:'home-construction', moving:'home-construction', remodeling:'home-construction',
  // Automotive
  auto:'automotive', automotive:'automotive', car:'automotive',
  mechanic:'automotive', tires:'automotive', detailing:'automotive',
  'car wash':'automotive', towing:'automotive', dealership:'automotive',
  // Professional Services
  consulting:'professional-services', marketing:'professional-services',
  photography:'professional-services', videography:'professional-services',
  'graphic design':'professional-services', printing:'professional-services',
  staffing:'professional-services', 'event planning':'professional-services',
  security:'professional-services', staffing_agency:'professional-services',
  // Education & Childcare
  education:'education-childcare', school:'education-childcare',
  tutoring:'education-childcare', daycare:'education-childcare',
  childcare:'education-childcare', preschool:'education-childcare',
  // Retail
  retail:'retail-products', store:'retail-products', shop:'retail-products',
  boutique:'retail-products', clothing:'retail-products', fashion:'retail-products',
  gifts:'retail-products', bookstore:'retail-products', grocery:'retail-products',
  florist:'retail-products', jewelry:'retail-products',
  // Faith & Community
  church:'faith-community', ministry:'faith-community', community:'faith-community',
  // Nonprofit
  nonprofit:'nonprofit', 'non-profit':'nonprofit', charity:'nonprofit', foundation:'nonprofit',
  // Real Estate
  'real estate':'real-estate', realtor:'real-estate', property:'real-estate', rental:'real-estate',
  // Entertainment & Travel
  entertainment:'entertainment-travel', travel:'entertainment-travel',
  hotel:'entertainment-travel', music:'entertainment-travel',
  art:'entertainment-travel', gym:'entertainment-travel',
  fitness:'entertainment-travel', yoga:'entertainment-travel', dance:'entertainment-travel',
  // Tech
  technology:'information-technology', tech:'information-technology',
  software:'programming-services', 'web design':'internet-services',
  'web development':'programming-services', it:'information-technology',
  // Veteran
  veteran:'veteran-services', military:'veteran-services',
}

const VALID_CATEGORIES = new Set([
  'food-dining','beauty-wellness','health-medical','legal-financial',
  'home-construction','automotive','professional-services','education-childcare',
  'retail-products','faith-community','real-estate','entertainment-travel',
  'internet-services','programming-services','information-technology',
  'nonprofit','veteran-services',
])

const US_STATE_ABBREVS = new Set([
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
])

const US_STATE_NAMES: Record<string, string> = {
  'alabama':'AL','alaska':'AK','arizona':'AZ','arkansas':'AR','california':'CA',
  'colorado':'CO','connecticut':'CT','delaware':'DE','florida':'FL','georgia':'GA',
  'hawaii':'HI','idaho':'ID','illinois':'IL','indiana':'IN','iowa':'IA','kansas':'KS',
  'kentucky':'KY','louisiana':'LA','maine':'ME','maryland':'MD','massachusetts':'MA',
  'michigan':'MI','minnesota':'MN','mississippi':'MS','missouri':'MO','montana':'MT',
  'nebraska':'NE','nevada':'NV','new hampshire':'NH','new jersey':'NJ',
  'new mexico':'NM','new york':'NY','north carolina':'NC','north dakota':'ND',
  'ohio':'OH','oklahoma':'OK','oregon':'OR','pennsylvania':'PA','rhode island':'RI',
  'south carolina':'SC','south dakota':'SD','tennessee':'TN','texas':'TX','utah':'UT',
  'vermont':'VT','virginia':'VA','washington':'WA','west virginia':'WV',
  'wisconsin':'WI','wyoming':'WY','district of columbia':'DC',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function mapCategory(raw: string | null | undefined): string {
  if (!raw) return 'professional-services'
  const s = raw.toLowerCase().trim()
  if (VALID_CATEGORIES.has(s)) return s
  if (CATEGORY_MAP[s]) return CATEGORY_MAP[s]
  for (const [key, val] of Object.entries(CATEGORY_MAP)) {
    if (s.includes(key) || key.includes(s)) return val
  }
  return 'professional-services'
}

function normalizeState(raw: string | null | undefined): string | null {
  if (!raw) return null
  const s = raw.trim()
  if (US_STATE_ABBREVS.has(s.toUpperCase())) return s.toUpperCase()
  return US_STATE_NAMES[s.toLowerCase()] ?? null
}

function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits[0] === '1') return `+${digits}`
  return null
}

function normalizeUrl(raw: string | null | undefined): string | null {
  if (!raw) return null
  const s = raw.trim()
  if (!s) return null
  if (s.startsWith('http://') || s.startsWith('https://')) return s
  return `https://${s}`
}

function makeSlug(name: string, city: string, state: string, existing: Set<string>): string {
  const base = `${name} ${city} ${state}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 80)
  let slug = base
  let n = 2
  while (existing.has(slug)) { slug = `${base}-${n}`; n++ }
  existing.add(slug)
  return slug
}

function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) return { headers: [], rows: [] }

  function parseLine(line: string): string[] {
    const cols: string[] = []
    let cur = '', inQuote = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQuote && line[i+1] === '"') { cur += '"'; i++ }
        else inQuote = !inQuote
      } else if (ch === ',' && !inQuote) {
        cols.push(cur.trim()); cur = ''
      } else cur += ch
    }
    cols.push(cur.trim())
    return cols
  }

  const headers = parseLine(lines[0]).map(h => h.toLowerCase().trim())
  const rows = lines.slice(1).map(line => {
    const vals = parseLine(line)
    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h] = vals[i] ?? '' })
    return row
  })
  return { headers, rows }
}

function detectColumns(headers: string[]): Record<string, string | null> {
  const find = (...candidates: string[]) =>
    candidates.find(c => headers.includes(c)) ?? null

  return {
    name:        find('name','business_name','title','biz_name','company','company_name'),
    category:    find('category','type','business_type','industry','business_category'),
    address:     find('address','street','street_address','addr','address1'),
    city:        find('city','town','municipality','locality'),
    state:       find('state','st','province','region'),
    zip:         find('zip','zipcode','zip_code','postal_code','postal'),
    phone:       find('phone','phone_number','telephone','tel','phone1'),
    website:     find('website','url','web','site','website_url'),
    email:       find('email','email_address','contact_email'),
    description: find('description','about','bio','summary','details'),
    lat:         find('lat','latitude'),
    lng:         find('lng','lon','longitude','long'),
  }
}

async function geocode(address: string | null, city: string, state: string): Promise<{ lat: number | null; lng: number | null }> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!apiKey) return { lat: null, lng: null }
  const q = address ? `${address}, ${city}, ${state}` : `${city}, ${state}`
  try {
    const r = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(q)}&key=${apiKey}`,
      { signal: AbortSignal.timeout(5000) }
    )
    const data = await r.json()
    if (data.status === 'OK') {
      const { lat, lng } = data.results[0].geometry.location
      return { lat, lng }
    }
  } catch {}
  return { lat: null, lng: null }
}

// ── Route handlers ─────────────────────────────────────────────────────────────

// POST /api/admin/import?action=preview  — parse CSV, return cleaned preview rows
// POST /api/admin/import?action=commit   — insert validated rows into DB

export async function POST(req: NextRequest) {
  // Auth check
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const action = req.nextUrl.searchParams.get('action') ?? 'preview'
  const body = await req.json() as { csv?: string; rows?: any[]; geocode?: boolean }

  // ── PREVIEW ──────────────────────────────────────────────────────────────────
  if (action === 'preview') {
    const { csv } = body
    if (!csv) return NextResponse.json({ error: 'No CSV provided' }, { status: 400 })

    const { headers, rows: rawRows } = parseCSV(csv)
    if (!headers.length) return NextResponse.json({ error: 'Could not parse CSV' }, { status: 400 })

    const colMap = detectColumns(headers)

    const get = (row: Record<string, string>, key: string) =>
      colMap[key] ? row[colMap[key]] || null : null

    const preview: any[] = []
    const errors: string[] = []

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i]
      const name = get(row, 'name')?.trim()
      const city = get(row, 'city')?.trim()
      const stateRaw = get(row, 'state')

      if (!name) { errors.push(`Row ${i + 2}: missing name`); continue }
      if (!city)  { errors.push(`Row ${i + 2}: missing city`); continue }
      const state = normalizeState(stateRaw)
      if (!state) { errors.push(`Row ${i + 2}: invalid state "${stateRaw}"`); continue }

      const catRaw = get(row, 'category')
      const category = mapCategory(catRaw)
      const categoryWarning = catRaw && !VALID_CATEGORIES.has(catRaw.toLowerCase().trim())

      preview.push({
        _row: i + 2,
        _categoryWarning: categoryWarning ? `"${catRaw}" mapped to ${category}` : null,
        name: name.trim().replace(/\b\w/g, c => c.toUpperCase()),
        category,
        address: get(row, 'address')?.trim() || null,
        city: city.replace(/\b\w/g, c => c.toUpperCase()),
        state,
        zip: get(row, 'zip')?.trim() || null,
        phone: normalizePhone(get(row, 'phone')),
        website: normalizeUrl(get(row, 'website')),
        email: get(row, 'email')?.trim().toLowerCase() || null,
        description: get(row, 'description')?.trim().substring(0, 1000) || null,
        lat: get(row, 'lat') ? parseFloat(get(row, 'lat')!) : null,
        lng: get(row, 'lng') ? parseFloat(get(row, 'lng')!) : null,
      })
    }

    return NextResponse.json({
      colMap,
      headers,
      totalRows: rawRows.length,
      validRows: preview.length,
      skippedRows: rawRows.length - preview.length,
      errors,
      preview: preview.slice(0, 200), // first 200 for the table
      allRows: preview,               // all rows for commit
    })
  }

  // ── COMMIT ───────────────────────────────────────────────────────────────────
  if (action === 'commit') {
    const { rows, geocode: doGeocode = true } = body
    if (!rows?.length) return NextResponse.json({ error: 'No rows provided' }, { status: 400 })

    const admin = createAdminClient()

    // Fetch existing slugs
    const { data: existing } = await admin.from('businesses').select('slug')
    const existingSlugs = new Set((existing ?? []).map((r: any) => r.slug))

    let inserted = 0
    let failed = 0
    const failedRows: any[] = []

    // Geocode and insert in batches of 50
    const BATCH = 50
    for (let i = 0; i < rows.length; i += BATCH) {
      const batch = rows.slice(i, i + BATCH)

      // Geocode rows missing lat/lng
      if (doGeocode) {
        await Promise.all(
          batch.map(async (row: any) => {
            if (row.lat == null || row.lng == null) {
              const coords = await geocode(row.address, row.city, row.state)
              row.lat = coords.lat
              row.lng = coords.lng
            }
          })
        )
      }

      const payload = batch.map((row: any) => {
        const slug = makeSlug(row.name, row.city, row.state, existingSlugs)
        const rec: Record<string, any> = {
          slug,
          name: row.name,
          category: row.category,
          status: 'active',
          subscription_status: 'none',
          owner_id: null,
          city: row.city,
          state: row.state,
          is_mobile_service: false,
          service_area: 'local',
          gold_shield: false,
          honor_pledge: false,
          sos_verified: false,
          phone_verified: false,
          website_reachable: false,
          photos: [],
          rating_count: 0,
          checkin_count: 0,
          follow_count: 0,
          profile_completion: 0,
        }
        if (row.address)     rec.address = row.address
        if (row.zip)         rec.zip = row.zip
        if (row.phone)       rec.phone = row.phone
        if (row.website)     rec.website = row.website
        if (row.email)       rec.email = row.email
        if (row.description) rec.description = row.description
        if (row.lat != null) rec.lat = row.lat
        if (row.lng != null) rec.lng = row.lng
        return rec
      })

      const { error } = await admin.from('businesses').insert(payload)
      if (error) {
        console.error('Batch insert error:', error.message)
        failed += batch.length
        failedRows.push(...batch.map((r: any) => ({ name: r.name, error: error.message })))
      } else {
        inserted += batch.length
      }
    }

    return NextResponse.json({ inserted, failed, failedRows })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
