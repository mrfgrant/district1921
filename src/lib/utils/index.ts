import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { BusinessCategory } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function categoryToSlug(category: BusinessCategory): string {
  return category
}

export function buildCategoryPageUrl(
  category: BusinessCategory,
  city: string,
  state: string
): string {
  return `/${category}-${slugify(city)}-${state.toLowerCase()}`
}

export function formatRating(avg: number | null, count: number): string {
  if (!avg || count === 0) return 'No ratings yet'
  return `${avg.toFixed(1)} (${count})`
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (match) return `(${match[1]}) ${match[2]}-${match[3]}`
  return phone
}

export function isBusinessOpen(hours: Record<string, { open: string; close: string; closed?: boolean }> | null): boolean {
  if (!hours) return false
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const today = days[new Date().getDay()]
  const todayHours = hours[today]
  if (!todayHours || todayHours.closed) return false

  const now = new Date()
  const [openH, openM] = todayHours.open.split(':').map(Number)
  const [closeH, closeM] = todayHours.close.split(':').map(Number)
  const openTime = openH * 60 + openM
  const closeTime = closeH * 60 + closeM
  const currentTime = now.getHours() * 60 + now.getMinutes()

  return currentTime >= openTime && currentTime < closeTime
}

export function getProfileCompletion(business: Record<string, unknown>): number {
  const fields = [
    'logo_url', 'cover_photo_url', 'description', 'phone',
    'website', 'email', 'hours', 'address', 'photos',
  ]
  const filled = fields.filter(f => {
    const val = business[f]
    if (Array.isArray(val)) return val.length > 0
    return val !== null && val !== undefined && val !== ''
  })
  return Math.round((filled.length / fields.length) * 100)
}
