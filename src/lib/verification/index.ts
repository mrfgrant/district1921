// ─── SOS (Secretary of State) Verification via OpenSOSData ───────────────────

export async function verifyBusinessSOS(
  businessName: string,
  state: string
): Promise<{ verified: boolean; details?: Record<string, unknown> }> {
  try {
    const res = await fetch(`https://api.openSOS.io/v1/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENSOS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: businessName, state }),
    })
    if (!res.ok) return { verified: false }
    const data = await res.json()
    return { verified: data.found === true, details: data }
  } catch {
    return { verified: false }
  }
}

// ─── Phone Verification via Twilio Lookup ────────────────────────────────────

export async function verifyPhone(
  phone: string
): Promise<{ verified: boolean; type?: string }> {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64')

    const res = await fetch(
      `https://lookups.twilio.com/v2/PhoneNumbers/${encodeURIComponent(phone)}`,
      {
        headers: { 'Authorization': `Basic ${credentials}` },
      }
    )
    if (!res.ok) return { verified: false }
    const data = await res.json()
    return { verified: data.valid === true, type: data.line_type_intelligence?.type }
  } catch {
    return { verified: false }
  }
}

// ─── Website Reachability Check ───────────────────────────────────────────────

export async function verifyWebsite(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(8000),
    })
    return res.ok
  } catch {
    return false
  }
}
