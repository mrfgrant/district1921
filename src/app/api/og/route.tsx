import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const name     = searchParams.get('name')     ?? 'Community Business'
  const city     = searchParams.get('city')      ?? ''
  const state    = searchParams.get('state')     ?? ''
  const category = searchParams.get('category') ?? ''
  const goldShield = searchParams.get('gold')   === '1'
  const logoUrl  = searchParams.get('logo')      ?? ''
  const rating   = searchParams.get('rating')    ?? ''

  const categoryEmoji: Record<string,string> = {
    'food-dining':'🍽','beauty-wellness':'💇','health-medical':'🩺',
    'legal-financial':'⚖️','home-construction':'🏗','automotive':'🚗',
    'professional-services':'💼','education-childcare':'📚',
    'retail-products':'🛍','faith-community':'🙏','real-estate':'🏠',
    'entertainment-travel':'🎭','internet-services':'🌐',
    'programming-services':'💻','information-technology':'🖥',
    'nonprofit':'🤝','veteran-services':'🎖',
  }
  const categoryLabel: Record<string,string> = {
    'food-dining':'Food & Dining','beauty-wellness':'Beauty & Wellness',
    'health-medical':'Health & Medical','legal-financial':'Legal & Financial',
    'home-construction':'Home & Construction','automotive':'Automotive',
    'professional-services':'Professional Services','education-childcare':'Education & Childcare',
    'retail-products':'Retail & Products','faith-community':'Faith & Community',
    'real-estate':'Real Estate','entertainment-travel':'Entertainment & Travel',
    'internet-services':'Internet Services','programming-services':'Programming Services',
    'information-technology':'Information Technology','nonprofit':'Non-Profit',
    'veteran-services':'Veteran Services',
  }

  const emoji    = categoryEmoji[category]  ?? '🏪'
  const catLabel = categoryLabel[category]  ?? 'Business'
  const fontSize = name.length > 28 ? 46 : name.length > 18 ? 56 : 68

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px', height: '630px',
          display: 'flex', flexDirection: 'column',
          backgroundColor: '#0f2318',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Left gold stripe */}
        <div style={{ position:'absolute', left:0, top:0, bottom:0, width:8, backgroundColor:'#c9a84c', display:'flex' }} />

        {/* Top gold rule */}
        <div style={{ position:'absolute', top:0, left:8, right:0, height:4, backgroundColor:'#c9a84c', opacity:0.6, display:'flex' }} />

        {/* Dark green accent panel top-right */}
        <div style={{ position:'absolute', top:0, right:0, width:320, height:200, backgroundColor:'#1a3a2a', display:'flex' }} />

        {/* Main content */}
        <div style={{
          display:'flex', flexDirection:'column', flex:1,
          padding:'52px 72px 48px 80px', position:'relative', zIndex:1,
        }}>

          {/* Header */}
          <div style={{ display:'flex', alignItems:'center', marginBottom:48 }}>
            <div style={{
              display:'flex', alignItems:'center', gap:10,
              backgroundColor:'#c9a84c', borderRadius:8,
              padding:'6px 14px',
            }}>
              <div style={{ fontSize:15, color:'#1a3a2a' }}>🏛</div>
              <div style={{ fontSize:16, fontWeight:800, color:'#1a3a2a', letterSpacing:'-0.3px' }}>
                District 1921
              </div>
            </div>
            <div style={{ flex:1 }} />
            <div style={{
              fontSize:11, color:'rgba(255,255,255,0.4)',
              letterSpacing:'0.15em', textTransform:'uppercase',
              display:'flex',
            }}>
              community business directory
            </div>
          </div>

          {/* Business block */}
          <div style={{ display:'flex', alignItems:'flex-start', gap:40, flex:1 }}>

            {/* Logo / Initial */}
            <div style={{
              width:140, height:140, borderRadius:18,
              border:'3px solid rgba(201,168,76,0.5)',
              overflow:'hidden', flexShrink:0,
              backgroundColor:'#1a3a2a',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              ) : (
                <div style={{ fontSize:64, color:'#c9a84c' }}>
                  {name[0]?.toUpperCase() ?? '?'}
                </div>
              )}
            </div>

            {/* Text */}
            <div style={{ display:'flex', flexDirection:'column', flex:1, paddingTop:8 }}>

              {/* Badge row */}
              <div style={{ display:'flex', gap:8, marginBottom:18, flexWrap:'wrap' }}>
                {goldShield && (
                  <div style={{
                    display:'flex', alignItems:'center', gap:5,
                    padding:'5px 12px', borderRadius:6,
                    backgroundColor:'rgba(201,168,76,0.18)',
                    border:'1px solid rgba(201,168,76,0.6)',
                    fontSize:11, fontWeight:800, color:'#c9a84c', letterSpacing:'0.06em',
                  }}>
                    🛡 GOLD SHIELD VERIFIED
                  </div>
                )}
                <div style={{
                  display:'flex', alignItems:'center', gap:5,
                  padding:'5px 12px', borderRadius:6,
                  backgroundColor:'rgba(255,255,255,0.07)',
                  fontSize:11, color:'rgba(255,255,255,0.55)', letterSpacing:'0.04em',
                }}>
                  {emoji}  {catLabel}
                </div>
              </div>

              {/* Name */}
              <div style={{
                fontSize, fontWeight:900, color:'#ffffff',
                lineHeight:1.05, letterSpacing:'-1.5px',
                marginBottom:18,
              }}>
                {name}
              </div>

              {/* Location + rating */}
              <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                {(city || state) && (
                  <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:18, color:'rgba(255,255,255,0.6)' }}>
                    <span>📍</span>
                    <span>{[city, state].filter(Boolean).join(', ')}</span>
                  </div>
                )}
                {rating && parseFloat(rating) > 0 && (
                  <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:18, color:'#c9a84c' }}>
                    <span>★  {parseFloat(rating).toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            paddingTop:28, marginTop:8,
            borderTop:'1px solid rgba(255,255,255,0.1)',
          }}>
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.3)', letterSpacing:'0.05em' }}>
              district1921.com
            </div>
            <div style={{
              padding:'10px 22px', backgroundColor:'#c9a84c',
              borderRadius:8, fontSize:13, fontWeight:800,
              color:'#0f2318', letterSpacing:'0.03em',
              display:'flex',
            }}>
              View Business →
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
