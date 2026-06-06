// Gold Shield verification checks

export async function checkWebsiteReachable(url: string): Promise<boolean> {
  if (!url) return false
  try {
    const normalized = url.startsWith('http') ? url : `https://${url}`
    const res = await fetch(normalized, { method: 'HEAD', signal: AbortSignal.timeout(8000) })
    return res.ok || res.status < 500
  } catch {
    return false
  }
}

export async function checkSOSRegistration(businessName: string, state: string): Promise<{
  found: boolean; details: string | null
}> {
  const apiKey = process.env.OPENSOS_API_KEY
  if (!apiKey) return { found: false, details: 'API key not configured' }
  try {
    const res = await fetch(
      `https://api.opensosd.com/v1/search?name=${encodeURIComponent(businessName)}&state=${state}&key=${apiKey}`,
      { signal: AbortSignal.timeout(10000) }
    )
    if (!res.ok) return { found: false, details: null }
    const data = await res.json()
    const found = data?.results?.length > 0
    const details = found ? data.results[0]?.status || 'Active' : null
    return { found, details }
  } catch {
    return { found: false, details: null }
  }
}

export async function checkPhoneVerified(phone: string): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  if (!sid || !token || !phone) return false
  try {
    const digits = phone.replace(/\D/g, '')
    const e164 = digits.startsWith('1') ? `+${digits}` : `+1${digits}`
    const res = await fetch(
      `https://lookups.twilio.com/v2/PhoneNumbers/${encodeURIComponent(e164)}`,
      { headers: { Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}` },
        signal: AbortSignal.timeout(8000) }
    )
    if (!res.ok) return false
    const data = await res.json()
    return data?.valid === true
  } catch {
    return false
  }
}
