import { Metadata } from 'next'
import { PlatformPreview } from '@/components/landing/PlatformPreview'

export const metadata: Metadata = {
  title: 'Platform Preview — District 1921',
  description: 'See what District 1921 looks like — search, map, business profiles, and Gold Shield verification.',
}

export default function PreviewPage() {
  return <PlatformPreview />
}
