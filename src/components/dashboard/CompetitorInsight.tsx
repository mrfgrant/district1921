'use client'
import { useEffect, useState } from 'react'
import { CATEGORY_LABELS } from '@/types'

type Competitor = {
  id: string
  name: string
  category: string
  city: string
  state: string
  distance_miles: number
  is_pro: boolean
  gold_shield: boolean
}

export function CompetitorInsight() {
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [loading, setLoading] = useState(true)
  const [noLocation, setNoLocation] = useState(false)

  useEffect(() => {
    fetch('/api/dashboard/competitors')
      .then(r => r.json())
      .then(data => {
        if (data.no_location) setNoLocation(true)
        else setCompetitors(data.competitors ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 mb-6 animate-pulse">
      <div className="h-4 bg-[var(--color-border)] rounded w-1/3 mb-4" />
      <div className="space-y-3">
        {[1,2,3].map(i => <div key={i} className="h-10 bg-[var(--color-border)] rounded" />)}
      </div>
    </div>
  )

  if (noLocation) return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 mb-6">
      <h3 className="text-sm font-semibold text-[var(--color-text)] mb-1">Nearby Competition</h3>
      <p className="text-sm text-[var(--color-text-secondary)]">
        Add your address or city to see similar businesses within 5 miles.
      </p>
    </div>
  )

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[var(--color-text)]">Nearby Competition</h3>
        <span className="text-xs text-[var(--color-text-secondary)]">Within 5 miles · same category</span>
      </div>

      {competitors.length === 0 ? (
        <p className="text-sm text-[#40916c] font-medium">No similar businesses found nearby — you have the market to yourself!</p>
      ) : (
        <>
          <p className="text-xs text-[var(--color-text-secondary)] mb-3">
            {competitors.length} similar business{competitors.length !== 1 ? 'es' : ''} within 5 miles
          </p>
          <div className="divide-y divide-[var(--color-border)]">
            {competitors.slice(0, 5).map(c => (
              <div key={c.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text)] truncate">{c.name}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">{c.city}, {c.state}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {c.gold_shield && (
                    <span className="text-xs bg-[#1a3a2a] text-[#c9a84c] px-2 py-0.5 rounded-full font-semibold">Shield</span>
                  )}
                  {c.is_pro && (
                    <span className="text-xs bg-[#c9a84c] text-[#1a3a2a] px-2 py-0.5 rounded-full font-semibold">Pro</span>
                  )}
                  <span className="text-xs text-[var(--color-text-secondary)] w-12 text-right">{c.distance_miles} mi</span>
                </div>
              </div>
            ))}
          </div>
          {competitors.length > 5 && (
            <p className="text-xs text-[var(--color-text-secondary)] mt-3">+{competitors.length - 5} more nearby</p>
          )}
        </>
      )}
    </div>
  )
}
