// ─── User & Auth ─────────────────────────────────────────────────────────────

export type UserRole = 'user' | 'free_owner' | 'paid_owner' | 'moderator' | 'admin'

export interface UserProfile {
  id: string
  email: string
  role: UserRole
  display_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

// ─── Business ─────────────────────────────────────────────────────────────────

export type BusinessCategory =
  | 'food-dining'
  | 'beauty-wellness'
  | 'health-medical'
  | 'legal-financial'
  | 'home-construction'
  | 'automotive'
  | 'professional-services'
  | 'education-childcare'
  | 'retail-products'
  | 'faith-community'
  | 'real-estate'
  | 'entertainment-travel'
  | 'internet-services'
  | 'programming-services'
  | 'information-technology'
  | 'nonprofit'
  | 'veteran-services'

export const CATEGORY_LABELS: Record<BusinessCategory, string> = {
  'food-dining': 'Food & Dining',
  'beauty-wellness': 'Beauty & Wellness',
  'health-medical': 'Health & Medical',
  'legal-financial': 'Legal & Financial',
  'home-construction': 'Home & Construction',
  'automotive': 'Automotive',
  'professional-services': 'Professional Services',
  'education-childcare': 'Education & Childcare',
  'retail-products': 'Retail & Products',
  'faith-community': 'Faith & Community',
  'real-estate': 'Real Estate',
  'entertainment-travel': 'Entertainment & Travel',
  'internet-services': 'Internet Services',
  'programming-services': 'Programming Services',
  'information-technology': 'Information Technology',
  'nonprofit': 'Non-Profit',
  'veteran-services': 'Veteran Services',
}

export type BusinessStatus = 'pending' | 'active' | 'suspended' | 'rejected'
export type SubscriptionStatus = 'none' | 'active' | 'past_due' | 'canceled'

export interface BusinessHours {
  monday?: { open: string; close: string; closed?: boolean }
  tuesday?: { open: string; close: string; closed?: boolean }
  wednesday?: { open: string; close: string; closed?: boolean }
  thursday?: { open: string; close: string; closed?: boolean }
  friday?: { open: string; close: string; closed?: boolean }
  saturday?: { open: string; close: string; closed?: boolean }
  sunday?: { open: string; close: string; closed?: boolean }
}

export interface Business {
  id: string
  owner_id: string
  slug: string
  name: string
  category: BusinessCategory
  status: BusinessStatus
  subscription_status: SubscriptionStatus

  // Location
  address: string | null
  city: string
  state: string
  zip: string | null
  lat: number | null
  lng: number | null
  is_mobile_service: boolean
  service_area: 'local' | 'statewide' | 'nationwide' | 'online'

  // Branding (paid only)
  logo_url: string | null
  cover_photo_url: string | null
  photos: string[]
  description: string | null

  // Contact (paid only)
  phone: string | null
  website: string | null
  email: string | null
  hours: BusinessHours | null

  // Trust
  gold_shield: boolean
  honor_pledge: boolean
  sos_verified: boolean
  phone_verified: boolean
  website_reachable: boolean
  proof_photo_url: string | null
  shield_approved_at: string | null

  // Social
  external_rating_url: string | null
  rating_avg: number | null
  rating_count: number
  checkin_count: number
  follow_count: number

  // Meta
  profile_completion: number
  created_at: string
  updated_at: string
}

// ─── Community ────────────────────────────────────────────────────────────────

export interface CommunityRequest {
  id: string
  user_id: string
  title: string
  description: string
  category: BusinessCategory | null
  city: string
  state: string
  is_open: boolean
  reply_count: number
  created_at: string
}

export interface CommunityReply {
  id: string
  request_id: string
  business_id: string
  message: string
  created_at: string
  business?: Pick<Business, 'name' | 'slug' | 'logo_url' | 'gold_shield'>
}

// ─── Events / Deals / Jobs ────────────────────────────────────────────────────

export interface BusinessEvent {
  id: string
  business_id: string
  title: string
  description: string
  start_date: string
  end_date: string | null
  location: string | null
  image_url: string | null
  is_free: boolean
  created_at: string
}

export interface BusinessDeal {
  id: string
  business_id: string
  title: string
  description: string
  discount_text: string | null
  expires_at: string | null
  image_url: string | null
  created_at: string
}

export interface JobPost {
  id: string
  business_id: string
  title: string
  description: string
  location: string
  is_remote: boolean
  pay_range: string | null
  expires_at: string
  created_at: string
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export type AnalyticsEventType =
  | 'view'
  | 'phone_click'
  | 'website_click'
  | 'directions_click'
  | 'share'
  | 'checkin'
  | 'follow'
  | 'recommendation'

export interface AnalyticsEvent {
  id: string
  business_id: string
  event_type: AnalyticsEventType
  user_id: string | null
  metadata: Record<string, unknown>
  created_at: string
}

// ─── Spotlight ────────────────────────────────────────────────────────────────

export interface Spotlight {
  id: string
  business_id: string
  week_of: string
  blurb: string | null
  created_at: string
  business?: Business
}

// ─── Boost / Featured ─────────────────────────────────────────────────────────

export interface ListingBoost {
  id: string
  business_id: string
  city: string
  state: string
  category: BusinessCategory | null
  boost_type: '7day' | '30day'
  starts_at: string
  ends_at: string
  created_at: string
}
