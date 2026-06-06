'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CATEGORY_LABELS, BusinessCategory } from '@/types'

const CATEGORY_ICONS: Record<string, string> = {
  'food-dining':'🍽','beauty-wellness':'💇','health-medical':'🩺',
  'legal-financial':'⚖️','home-construction':'🏗','automotive':'🚗',
  'professional-services':'💼','education-childcare':'📚',
  'retail-products':'🛒','faith-community':'⛪','real-estate':'🏠','entertainment-travel':'🎭',
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hrs = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 60) return `${mins}m ago`
  if (hrs < 24) return `${hrs}h ago`
  return `${days}d ago`
}

interface Request {
  id: string; title: string; description: string
  category: string | null; city: string; state: string
  is_open: boolean; reply_count: number; created_at: string
  user: { email: string } | null
}

export function RequestsBoard({
  requests: initial, repliesByRequest, user, userBusiness,
  currentCategory, currentState,
}: {
  requests: Request[]
  repliesByRequest: Record<string, any[]>
  user: { id: string; email: string } | null
  userBusiness: { id: string; name: string; category: string; city: string; state: string; subscription_status: string; slug: string } | null
  currentCategory?: string
  currentState?: string
}) {
  const router = useRouter()
  const [requests, setRequests] = useState(initial)
  const [replies, setReplies] = useState(repliesByRequest)
  const [showPostForm, setShowPostForm] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [replyLoading, setReplyLoading] = useState(false)
  const [postLoading, setPostLoading] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: '', description: '', category: '', city: '', state: '',
  })

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  async function handlePost(e: React.FormEvent) {
    e.preventDefault()
    if (!user) { router.push('/login?next=/requests'); return }
    setPostLoading(true)
    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const { request } = await res.json()
      setRequests(prev => [request, ...prev])
      setForm({ title: '', description: '', category: '', city: '', state: '' })
      setShowPostForm(false)
      showToast('Your request has been posted.')
    }
    setPostLoading(false)
  }

  async function handleReply(requestId: string) {
    if (!replyText.trim()) return
    setReplyLoading(true)
    const res = await fetch('/api/requests/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, message: replyText }),
    })
    if (res.ok) {
      setReplies(prev => ({
        ...prev,
        [requestId]: [...(prev[requestId] ?? []), {
          id: Date.now(), request_id: requestId,
          business: userBusiness, message: replyText, created_at: new Date().toISOString(),
        }],
      }))
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, reply_count: r.reply_count + 1 } : r))
      setReplyText('')
      setReplyingTo(null)
      showToast('Your reply has been sent.')
    }
    setReplyLoading(false)
  }

  const isPaidOwner = !!userBusiness

  const S = { fontFamily: "'Playfair Display', serif" }

  return (
    <div style={{ minHeight: '100vh', background: '#faf7f0', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 1000, background: '#1a3a2a', color: '#fff', padding: '12px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          {toast}
        </div>
      )}

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1a3a2a 0%, #2d6a4f 60%, #1a4a35 100%)', padding: '48px 32px 40px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#c9a84c', marginBottom: 12 }}>District 1921 · Community Requests</p>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ ...S, fontSize: 'clamp(32px,6vw,48px)', fontWeight: 900, color: '#fff', marginBottom: 8, lineHeight: 1.1 }}>
                Need something?<br /><em style={{ color: '#c9a84c', fontStyle: 'italic' }}>Ask the community.</em>
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, maxWidth: 440 }}>
                Post a need — verified community businesses will respond directly. Free to post, free to read.
              </p>
            </div>
            <button
              onClick={() => user ? setShowPostForm(true) : router.push('/login?next=/requests')}
              style={{ padding: '13px 24px', background: '#c9a84c', border: 'none', borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700, color: '#1a3a2a', cursor: 'pointer', whiteSpace: 'nowrap', alignSelf: 'flex-start' }}>
              + Post a Request
            </button>
          </div>

          {/* Category filters */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 24 }}>
            <Link href="/requests" style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, textDecoration: 'none', background: !currentCategory ? '#c9a84c' : 'rgba(255,255,255,0.12)', color: !currentCategory ? '#1a3a2a' : 'rgba(255,255,255,0.85)', border: '1px solid', borderColor: !currentCategory ? '#c9a84c' : 'rgba(255,255,255,0.2)' }}>
              All Requests
            </Link>
            {(Object.entries(CATEGORY_LABELS) as [BusinessCategory, string][]).map(([key, label]) => (
              <Link key={key} href={`/requests?category=${key}`} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, textDecoration: 'none', background: currentCategory === key ? '#c9a84c' : 'rgba(255,255,255,0.12)', color: currentCategory === key ? '#1a3a2a' : 'rgba(255,255,255,0.85)', border: '1px solid', borderColor: currentCategory === key ? '#c9a84c' : 'rgba(255,255,255,0.2)' }}>
                {CATEGORY_ICONS[key]} {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Post form modal */}
      {showPostForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ ...S, fontSize: 22, fontWeight: 700, color: '#1a3a2a', margin: 0 }}>Post a Request</h2>
              <button onClick={() => setShowPostForm(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6b7280' }}>×</button>
            </div>
            <form onSubmit={handlePost}>
              {[
                { key: 'title', label: 'What do you need?', placeholder: 'e.g. Looking for a plumber in Augusta', type: 'text' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1c1c1c', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{f.label}</label>
                  <input type={f.type} required placeholder={f.placeholder} value={(form as any)[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #d4cfc7', borderRadius: 6, fontSize: 14, outline: 'none', fontFamily: "'DM Sans',sans-serif" }} />
                </div>
              ))}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1c1c1c', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Tell us more</label>
                <textarea required rows={4} placeholder="Describe what you need, your budget, timeline, anything that helps businesses understand your request..."
                  value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #d4cfc7', borderRadius: 6, fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: "'DM Sans',sans-serif", lineHeight: 1.6 }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1c1c1c', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>City</label>
                  <input required placeholder="Augusta" value={form.city} onChange={e => setForm(prev => ({ ...prev, city: e.target.value }))}
                    style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #d4cfc7', borderRadius: 6, fontSize: 14, outline: 'none', fontFamily: "'DM Sans',sans-serif" }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1c1c1c', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>State</label>
                  <input required placeholder="GA" maxLength={2} value={form.state} onChange={e => setForm(prev => ({ ...prev, state: e.target.value.toUpperCase() }))}
                    style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #d4cfc7', borderRadius: 6, fontSize: 14, outline: 'none', fontFamily: "'DM Sans',sans-serif" }} />
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1c1c1c', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Category <span style={{ color: '#b0a898', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                <select value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                  style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #d4cfc7', borderRadius: 6, fontSize: 14, outline: 'none', fontFamily: "'DM Sans',sans-serif", background: '#fff', cursor: 'pointer' }}>
                  <option value="">Select a category</option>
                  {(Object.entries(CATEGORY_LABELS) as [BusinessCategory, string][]).map(([key, label]) => (
                    <option key={key} value={key}>{CATEGORY_ICONS[key]} {label}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setShowPostForm(false)}
                  style={{ flex: 1, padding: '13px', background: '#fff', border: '1.5px solid #d4cfc7', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#6b7280' }}>
                  Cancel
                </button>
                <button type="submit" disabled={postLoading}
                  style={{ flex: 2, padding: '13px', background: '#1a3a2a', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', color: '#fff', opacity: postLoading ? 0.7 : 1 }}>
                  {postLoading ? 'Posting…' : 'Post Request'}
                </button>
              </div>
              <p style={{ fontSize: 11, color: '#b0a898', textAlign: 'center', marginTop: 12 }}>Your email is never shared publicly.</p>
            </form>
          </div>
        </div>
      )}

      {/* Main content */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '36px 24px' }}>

        {/* How it works */}
        <div style={{ background: '#fff', border: '1px solid #e5e0d5', borderRadius: 12, padding: '20px 24px', marginBottom: 28, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {[
            { icon: '✍️', title: 'Post your need', desc: 'Tell the community what you\'re looking for. Free for any signed-in member.' },
            { icon: '🔔', title: 'Businesses respond', desc: 'Matching Pro businesses in your city get notified and can reply directly.' },
            { icon: '🤝', title: 'Connect directly', desc: 'Review replies and connect with the business that fits. No middleman.' },
          ].map(s => (
            <div key={s.title}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1a3a2a', marginBottom: 4 }}>{s.title}</div>
              <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>

        {/* Pro owner notice */}
        {!isPaidOwner && user && (
          <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.25)', borderLeft: '3px solid #c9a84c', borderRadius: 8, padding: '14px 18px', marginBottom: 24, fontSize: 13, color: '#5a4a20', lineHeight: 1.6 }}>
            💼 <strong>Business owner?</strong> Upgrade to a Professional Page to reply to requests and get matched with community leads. <Link href="/dashboard/billing" style={{ color: '#c9a84c', fontWeight: 700, textDecoration: 'none' }}>Upgrade for $15/mo →</Link>
          </div>
        )}

        {/* Requests list */}
        {requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🙋</div>
            <p style={{ ...S, fontSize: 24, fontWeight: 700, color: '#1a3a2a', marginBottom: 8 }}>No requests yet</p>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>Be the first to post a community request.</p>
            <button onClick={() => user ? setShowPostForm(true) : router.push('/login?next=/requests')}
              style={{ padding: '12px 24px', background: '#1a3a2a', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#fff', fontFamily: "'DM Sans',sans-serif" }}>
              Post a Request
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>{requests.length} open request{requests.length !== 1 ? 's' : ''}</p>

            {requests.map(req => {
              const reqReplies = replies[req.id] ?? []
              const isExpanded = expandedId === req.id
              const isReplying = replyingTo === req.id

              return (
                <div key={req.id} style={{ background: '#fff', border: '1px solid #e5e0d5', borderRadius: 14, overflow: 'hidden' }}>
                  {/* Request header */}
                  <div style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                          {req.category && (
                            <span style={{ fontSize: 11, background: '#f0faf4', color: '#2d6a4f', fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>
                              {CATEGORY_ICONS[req.category]} {CATEGORY_LABELS[req.category as BusinessCategory]}
                            </span>
                          )}
                          <span style={{ fontSize: 11, color: '#6b7280' }}>📍 {req.city}, {req.state}</span>
                          <span style={{ fontSize: 11, color: '#b0a898' }}>{timeAgo(req.created_at)}</span>
                        </div>
                        <h3 style={{ ...S, fontSize: 18, fontWeight: 700, color: '#1a3a2a', margin: '0 0 8px' }}>{req.title}</h3>
                        <p style={{ fontSize: 13, color: '#4a4540', lineHeight: 1.7, margin: 0 }}>{req.description}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                      {req.reply_count > 0 && (
                        <button onClick={() => { setExpandedId(isExpanded ? null : req.id) }}
                          style={{ padding: '7px 14px', background: '#f0faf4', border: '1px solid #b8e0c4', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#2d6a4f', fontFamily: "'DM Sans',sans-serif" }}>
                          {isPaidOwner ? `${req.reply_count} repl${req.reply_count !== 1 ? 'ies' : 'y'} ${isExpanded ? '↑' : '↓'}` : `${req.reply_count} repl${req.reply_count !== 1 ? 'ies' : 'y'} — upgrade to view`}
                        </button>
                      )}
                      {isPaidOwner && (
                        <button onClick={() => { setReplyingTo(isReplying ? null : req.id); setReplyText('') }}
                          style={{ padding: '7px 14px', background: isReplying ? '#1a3a2a' : '#fff', border: '1px solid #d4cfc7', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: isReplying ? '#fff' : '#6b7280', fontFamily: "'DM Sans',sans-serif" }}>
                          {isReplying ? 'Cancel' : '↩ Reply as ' + userBusiness!.name}
                        </button>
                      )}
                      {!user && (
                        <Link href="/login?next=/requests" style={{ padding: '7px 14px', background: '#fff', border: '1px solid #d4cfc7', borderRadius: 6, fontSize: 12, fontWeight: 600, color: '#6b7280', textDecoration: 'none' }}>
                          Sign in to reply
                        </Link>
                      )}
                      {user && !isPaidOwner && (
                        <Link href="/dashboard/billing" style={{ padding: '7px 14px', background: '#fff', border: '1px solid #c9a84c', borderRadius: 6, fontSize: 12, fontWeight: 600, color: '#c9a84c', textDecoration: 'none' }}>
                          Upgrade to Reply
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Replies — only visible to paid owners */}
                  {isExpanded && isPaidOwner && reqReplies.length > 0 && (
                    <div style={{ borderTop: '1px solid #e5e0d5', background: '#faf7f0' }}>
                      {reqReplies.map((reply: any) => (
                        <div key={reply.id} style={{ padding: '14px 24px', borderBottom: '1px solid #e5e0d5' }}>
                          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#d8f3dc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#2d6a4f', fontFamily: "'Playfair Display',serif", flexShrink: 0 }}>
                              {reply.business?.name?.[0] ?? 'B'}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <Link href={`/business/${reply.business?.slug}`} style={{ fontSize: 13, fontWeight: 700, color: '#1a3a2a', textDecoration: 'none' }}>
                                  {reply.business?.name ?? 'Business'}
                                </Link>
                                <span style={{ fontSize: 11, color: '#b0a898' }}>{timeAgo(reply.created_at)}</span>
                              </div>
                              <p style={{ fontSize: 13, color: '#4a4540', lineHeight: 1.65, margin: 0 }}>{reply.message}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply form */}
                  {isReplying && isPaidOwner && (
                    <div style={{ borderTop: '1px solid #e5e0d5', padding: '16px 24px', background: '#f5f0e8' }}>
                      <textarea
                        rows={3}
                        placeholder={`Reply as ${userBusiness!.name}...`}
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #d4cfc7', borderRadius: 8, fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: "'DM Sans',sans-serif", marginBottom: 10, lineHeight: 1.6, background: '#fff' }}
                      />
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button onClick={() => { setReplyingTo(null); setReplyText('') }}
                          style={{ padding: '8px 16px', background: '#fff', border: '1px solid #d4cfc7', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#6b7280', fontFamily: "'DM Sans',sans-serif" }}>
                          Cancel
                        </button>
                        <button onClick={() => handleReply(req.id)} disabled={!replyText.trim() || replyLoading}
                          style={{ padding: '8px 20px', background: '#1a3a2a', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', color: '#fff', fontFamily: "'DM Sans',sans-serif", opacity: (!replyText.trim() || replyLoading) ? 0.5 : 1 }}>
                          {replyLoading ? 'Sending…' : 'Send Reply'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Bottom CTA */}
        <div style={{ background: '#1a3a2a', borderRadius: 12, padding: '28px 32px', marginTop: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ ...S, fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Have a need? Post it free.</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Community members can post requests at no cost. Businesses reply.</p>
          </div>
          <button onClick={() => user ? setShowPostForm(true) : router.push('/login?next=/requests')}
            style={{ background: '#c9a84c', color: '#1a3a2a', padding: '12px 24px', borderRadius: 8, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", whiteSpace: 'nowrap' }}>
            Post a Request →
          </button>
        </div>
      </div>
    </div>
  )
}
