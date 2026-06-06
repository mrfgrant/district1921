export async function geocodeAddress(
  address: string,
  city: string,
  state: string,
  zip?: string
): Promise<{ lat: number; lng: number } | null> {
  const query = [address, city, state, zip].filter(Boolean).join(', ')
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`

  try {
    const res = await fetch(url)
    const data = await res.json()
    if (data.status === 'OK' && data.results[0]) {
      const { lat, lng } = data.results[0].geometry.location
      return { lat, lng }
    }
    return null
  } catch {
    return null
  }
}
