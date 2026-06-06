'use client'
import { useState } from 'react'
import Link from 'next/link'
import { CATEGORY_LABELS, BusinessCategory } from '@/types'

interface Business {
  id: string
  name: string
  slug: string
  category: string
  status: string
  subscription_status: string
  city: string
  state: string
  address: string | null
  phone: string | null
  website: string | null
  description: string | null
  honor_pledge: boolean
  is_mobile_service: boolean
  gold_shield: boolean
  created_at: string
  owner_id: string
  owner: { email: string; role: string } | null
}

const STATUS_TABS = [
  { key: 'pending', label: 'Pending Review' },
  { key: 'active', label: 'Active' },
  { key: 'suspended', label: 'Suspended' },
  { key: 'rejected', label: 'Rejected' },
]

export function ListingsQueue({
  businesses: initial,
  currentStatus,
}: {
  businesses: Business[]
  currentStatus: string
}) {
  const [businesses, setBusinesses] = useState(initial)
  const [loading, setLoading] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  function showToast(msg: string, type: 'success' | 'error') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleAction(businessId: string, action: 'approve' | 'reject' | 'suspend') {
    setLoading(businessId + action)
    try {
      const res = await fetch('/api/admin/listings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, action }),
      })
      if (res.ok) {
        setBusinesses(prev => prev.filter(b => b.id !== businessId))
        showToast(
          action === 'approve' ? 'Listing approved — owner notified.' :
          action === 'reject' ? 'Listing rejected.' : 'Listing suspended.',
          'success'
        )
      } else {
        showToast('Action failed. Try again.', 'error')
      }
    } catch {
      showToast('Network error.', 'error')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="max-w-5xl">
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 1000,
          background: toast.type === 'success' ? '#1a3a2a' : '#8B2020',
          color: '#fff', padding: '12px 20px', borderRadius: 8,
          fontSize: 13, fontWeight: 600, boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}>
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-2xl text-[var(--color-gold)]">Listings Queue</h1>
        <Link href="/admin" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-gold)]">← Back to Overview</Link>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 mb-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-1 w-fit">
        {STATUS_TABS.map(tab => (
          <Link key={tab.key} href={`/admin/listings?status=${tab.key}`}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentStatus === tab.key
                ? 'bg-[var(--color-gold)] text-[var(--color-midnight)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
            }`}>
            {tab.label}
          </Link>
        ))}
      </div>

      {businesses.length === 0 ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-12 text-center">
          <div className="text-4xl mb-3">✓</div>
          <p className="font-semibold text-[var(--color-text)] mb-1">All clear</p>
          <p className="text-sm text-[var(--color-text-secondary)]">No {currentStatus} listings right now.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {businesses.map(biz => (
            <div key={biz.id}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">

              {/* Card header */}
              <div className="flex items-start justify-between p-5 gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-[var(--color-text)]">{biz.name}</span>
                    {biz.subscription_status === 'active' && (
                      <span className="px-2 py-0.5 bg-[#c9a84c]/20 text-[#c9a84c] text-xs font-bold rounded">PRO</span>
                    )}
                    {biz.is_mobile_service && (
                      <span className="px-2 py-0.5 bg-blue-900/30 text-blue-400 text-xs font-medium rounded">📱 Mobile</span>
                    )}
                    {biz.honor_pledge && (
                      <span className="px-2 py-0.5 bg-green-900/30 text-green-400 text-xs font-medium rounded">✓ Pledge</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[var(--color-text-secondary)] flex-wrap">
                    <span>{CATEGORY_LABELS[biz.category as BusinessCategory] ?? biz.category}</span>
                    <span>·</span>
                    <span>{biz.city}, {biz.state}</span>
                    <span>·</span>
                    <span>{biz.owner?.email}</span>
                    <span>·</span>
                    <span>{new Date(biz.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setExpanded(expanded === biz.id ? null : biz.id)}
                    className="px-3 py-1.5 text-xs font-medium border border-[var(--color-border)] rounded text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors">
                    {expanded === biz.id ? 'Less ↑' : 'Details ↓'}
                  </button>

                  {currentStatus === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAction(biz.id, 'reject')}
                        disabled={loading === biz.id + 'reject'}
                        className="px-3 py-1.5 text-xs font-semibold border border-red-800 text-red-400 rounded hover:bg-red-900/20 transition-colors disabled:opacity-50">
                        Reject
                      </button>
                      <button
                        onClick={() => handleAction(biz.id, 'approve')}
                        disabled={loading === biz.id + 'approve'}
                        className="px-4 py-1.5 text-xs font-bold bg-[#2d6a4f] text-white rounded hover:bg-[#1a3a2a] transition-colors disabled:opacity-50">
                        {loading === biz.id + 'approve' ? 'Approving…' : '✓ Approve'}
                      </button>
                    </>
                  )}

                  {currentStatus === 'active' && (
                    <button
                      onClick={() => handleAction(biz.id, 'suspend')}
                      disabled={loading === biz.id + 'suspend'}
                      className="px-3 py-1.5 text-xs font-semibold border border-yellow-800 text-yellow-400 rounded hover:bg-yellow-900/20 transition-colors disabled:opacity-50">
                      Suspend
                    </button>
                  )}

                  {currentStatus === 'suspended' && (
                    <button
                      onClick={() => handleAction(biz.id, 'approve')}
                      disabled={loading === biz.id + 'approve'}
                      className="px-4 py-1.5 text-xs font-bold bg-[#2d6a4f] text-white rounded hover:bg-[#1a3a2a] transition-colors disabled:opacity-50">
                      Reinstate
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded details */}
              {expanded === biz.id && (
                <div className="border-t border-[var(--color-border)] px-5 py-4 grid grid-cols-2 gap-x-8 gap-y-3">
                  {[
                    { label: 'Address', value: [biz.address, biz.city, biz.state].filter(Boolean).join(', ') || '—' },
                    { label: 'Phone', value: biz.phone || '—' },
                    { label: 'Website', value: biz.website || '—' },
                    { label: 'Owner Email', value: biz.owner?.email || '—' },
                    { label: 'Owner Role', value: biz.owner?.role || '—' },
                    { label: 'Subscription', value: biz.subscription_status },
                  ].map(row => (
                    <div key={row.label}>
                      <div className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-0.5">{row.label}</div>
                      <div className="text-sm text-[var(--color-text)] break-all">{row.value}</div>
                    </div>
                  ))}

                  {biz.description && (
                    <div className="col-span-2">
                      <div className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-1">Description</div>
                      <div className="text-sm text-[var(--color-text-secondary)] leading-relaxed bg-[var(--color-midnight)] rounded p-3">
                        {biz.description}
                      </div>
                    </div>
                  )}

                  <div className="col-span-2 flex gap-3 pt-2">
                    <a href={`/business/${biz.slug}`} target="_blank"
                      className="text-xs text-[var(--color-gold)] underline underline-offset-2">
                      View listing page ↗
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
