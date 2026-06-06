import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const name = searchParams.get('name') ?? 'Community Business'
  const city = searchParams.get('city') ?? ''
  const state = searchParams.get('state') ?? ''
  const category = searchParams.get('category') ?? ''
  const goldShield = searchParams.get('gold') === '1'
  const logoUrl = searchParams.get('logo') ?? ''
  const rating = searchParams.get('rating') ?? ''

  // Category emoji map
  const categoryEmoji: Record<string, string> = {
    'food-dining': '🍽', 'beauty-wellness': '💇', 'health-medical': '🩺',
    'legal-financial': '⚖️', 'home-construction': '🏗', 'automotive': '🚗',
    'professional-services': '💼', 'education-childcare': '📚',
    'retail-products': '🛍', 'faith-community': '🙏', 'real-estate': '🏠',
    'entertainment-travel': '🎭', 'internet-services': '🌐',
    'programming-services': '💻', 'information-technology': '🖥',
    'nonprofit': '🤝', 'veteran-services': '🎖',
  }
  const emoji = categoryEmoji[category] ?? '🏪'

  const categoryLabel: Record<string, string> = {
    'food-dining': 'Food & Dining', 'beauty-wellness': 'Beauty & Wellness',
    'health-medical': 'Health & Medical', 'legal-financial': 'Legal & Financial',
    'home-construction': 'Home & Construction', 'automotive': 'Automotive',
    'professional-services': 'Professional Services', 'education-childcare': 'Education & Childcare',
    'retail-products': 'Retail & Products', 'faith-community': 'Faith & Community',
    'real-estate': 'Real Estate', 'entertainment-travel': 'Entertainment & Travel',
    'internet-services': 'Internet Services', 'programming-services': 'Programming Services',
    'information-technology': 'Information Technology', 'nonprofit': 'Non-Profit',
    'veteran-services': 'Veteran Services',
  }
  const catLabel = categoryLabel[category] ?? 'Business'

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #0d2018 0%, #1a3a2a 45%, #0f2a1e 100%)',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'serif',
        }}
      >
        {/* Decorative grain texture via radial gradients */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 20% 50%, rgba(201,168,76,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(45,106,79,0.12) 0%, transparent 50%)',
          display: 'flex',
        }} />

        {/* Top decorative line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
          background: 'linear-gradient(90deg, transparent, #c9a84c, #c9a84c, transparent)',
          display: 'flex',
        }} />

        {/* Grid pattern overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.03,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          display: 'flex',
        }} />

        {/* Main content */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          padding: '56px 72px', position: 'relative', zIndex: 1,
        }}>

          {/* Header — District 1921 wordmark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              background: '#c9a84c',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px',
            }}>🏛</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>
              District <span style={{ color: '#c9a84c' }}>1921</span>
            </div>
            <div style={{ flex: 1 }} />
            {/* Community pill */}
            <div style={{
              padding: '6px 14px',
              background: 'rgba(201,168,76,0.12)',
              border: '1px solid rgba(201,168,76,0.35)',
              borderRadius: '20px',
              fontSize: '11px', color: '#c9a84c',
              letterSpacing: '0.15em', textTransform: 'uppercase',
              display: 'flex',
            }}>
              Community Business Directory
            </div>
          </div>

          {/* Business info — main content */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '40px', flex: 1 }}>

            {/* Logo or initial */}
            <div style={{
              width: '140px', height: '140px', borderRadius: '20px',
              border: '3px solid rgba(201,168,76,0.4)',
              overflow: 'hidden', flexShrink: 0,
              background: logoUrl ? 'transparent' : '#1a3a2a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ fontSize: '64px', color: '#c9a84c', fontFamily: 'serif' }}>
                  {name[0]?.toUpperCase()}
                </div>
              )}
            </div>

            {/* Text block */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingTop: '8px' }}>

              {/* Badges */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {goldShield && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '5px 12px', borderRadius: '6px',
                    background: 'rgba(201,168,76,0.15)',
                    border: '1px solid rgba(201,168,76,0.5)',
                    fontSize: '12px', fontWeight: 700, color: '#c9a84c',
                    letterSpacing: '0.05em',
                  }}>
                    🛡 GOLD SHIELD
                  </div>
                )}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '5px 12px', borderRadius: '6px',
                  background: 'rgba(255,255,255,0.07)',
                  fontSize: '12px', color: 'rgba(255,255,255,0.6)',
                  letterSpacing: '0.03em',
                }}>
                  {emoji} {catLabel}
                </div>
              </div>

              {/* Business name */}
              <div style={{
                fontSize: name.length > 25 ? '44px' : name.length > 18 ? '52px' : '62px',
                fontWeight: 900, color: '#fff',
                lineHeight: 1.05, letterSpacing: '-1px',
                marginBottom: '16px',
                fontFamily: 'serif',
              }}>
                {name}
              </div>

              {/* Location + rating */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {(city || state) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '18px', color: 'rgba(255,255,255,0.65)' }}>
                    <span>📍</span>
                    <span>{[city, state].filter(Boolean).join(', ')}</span>
                  </div>
                )}
                {rating && parseFloat(rating) > 0 && (
                  <>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)', display: 'flex' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '18px', color: '#c9a84c' }}>
                      <span>★</span>
                      <span>{parseFloat(rating).toFixed(1)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            paddingTop: '32px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>
              district1921.com
            </div>
            <div style={{
              padding: '10px 20px',
              background: '#c9a84c',
              borderRadius: '8px',
              fontSize: '13px', fontWeight: 700, color: '#1a3a2a',
              letterSpacing: '0.03em',
            }}>
              View Business →
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
