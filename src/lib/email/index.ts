import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = `District 1921 <${process.env.RESEND_FROM_EMAIL ?? 'hello@mail.district1921.com'}>`

// ─── Magic Link ───────────────────────────────────────────────────────────────

export async function sendMagicLink(to: string, magicLink: string) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: 'Your sign-in link for District 1921',
    html: magicLinkHtml(magicLink, to),
  })
}

// ─── Business Submitted ───────────────────────────────────────────────────────

export async function sendBusinessSubmitted(to: string, businessName: string) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `${businessName} is under review — District 1921`,
    html: businessSubmittedHtml(businessName),
  })
}

// ─── Business Approved ────────────────────────────────────────────────────────

export async function sendBusinessApproved(to: string, businessName: string, slug: string) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/business/${slug}`
  return resend.emails.send({
    from: FROM,
    to,
    subject: `${businessName} is live on District 1921`,
    html: businessApprovedHtml(businessName, url),
  })
}

// ─── Templates ────────────────────────────────────────────────────────────────

const BASE = `
  <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:#faf7f0;padding:0;margin:0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f0;">
      <tr><td align="center" style="padding:40px 16px;">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e0d5;border-radius:8px;overflow:hidden;max-width:560px;">
          <tr>
            <td style="background:#1a3a2a;padding:24px 32px;">
              <span style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:#ffffff;">
                District <span style="color:#c9a84c;">1921</span>
              </span>
            </td>
          </tr>
          <tr><td style="padding:36px 32px;">
            BODY
          </td></tr>
          <tr>
            <td style="background:#f5f0e8;border-top:1px solid #e5e0d5;padding:20px 32px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#8a7a5a;letter-spacing:0.05em;">
                District 1921 · All 50 States · Built for the community
              </p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </div>
`

function wrap(body: string) {
  return BASE.replace('BODY', body)
}

function magicLinkHtml(link: string, email: string) {
  return wrap(`
    <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:700;color:#1a3a2a;margin:0 0 8px;">
      Sign in to District 1921
    </h1>
    <p style="font-size:15px;color:#6b7280;line-height:1.6;margin:0 0 28px;">
      Click the button below to sign in. This link expires in 1 hour and can only be used once.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="background:#1a3a2a;border-radius:6px;">
          <a href="${link}" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.03em;">
            Sign In to District 1921 →
          </a>
        </td>
      </tr>
    </table>
    <p style="font-size:12px;color:#b0a898;line-height:1.6;margin:0 0 4px;">
      Or copy and paste this link into your browser:
    </p>
    <p style="font-size:11px;color:#c9a84c;word-break:break-all;margin:0 0 24px;">
      ${link}
    </p>
    <hr style="border:none;border-top:1px solid #e5e0d5;margin:24px 0;" />
    <p style="font-size:12px;color:#b0a898;margin:0;">
      If you didn't request this, ignore this email. Your account is safe.
      <br />Sent to ${email}
    </p>
  `)
}

function businessSubmittedHtml(businessName: string) {
  return wrap(`
    <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:700;color:#1a3a2a;margin:0 0 8px;">
      You're in the queue.
    </h1>
    <p style="font-size:15px;color:#6b7280;line-height:1.6;margin:0 0 20px;">
      <strong style="color:#1a3a2a;">${businessName}</strong> has been submitted to the District 1921 directory and is currently under review.
    </p>
    <div style="background:#d8f3dc;border-left:4px solid #2d6a4f;border-radius:4px;padding:16px 20px;margin-bottom:28px;">
      <p style="margin:0;font-size:14px;color:#1a3a2a;line-height:1.6;">
        Our team will review your listing within <strong>24–48 hours</strong>. Once approved, it will appear in search results immediately.
      </p>
    </div>
    <p style="font-size:14px;color:#6b7280;line-height:1.6;margin:0 0 6px;"><strong style="color:#1a3a2a;">What happens next:</strong></p>
    <ul style="font-size:14px;color:#6b7280;line-height:1.8;margin:0 0 28px;padding-left:20px;">
      <li>Your listing goes live after approval</li>
      <li>Upgrade to a Professional Page anytime from your dashboard ($15/mo)</li>
      <li>Apply for Gold Shield verification once your page is live</li>
    </ul>
    <table cellpadding="0" cellspacing="0">
      <tr>
        <td style="background:#1a3a2a;border-radius:6px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display:inline-block;padding:12px 28px;font-size:13px;font-weight:600;color:#ffffff;text-decoration:none;">
            Go to Dashboard →
          </a>
        </td>
      </tr>
    </table>
  `)
}

function businessApprovedHtml(businessName: string, url: string) {
  return wrap(`
    <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:700;color:#1a3a2a;margin:0 0 8px;">
      You're live.
    </h1>
    <p style="font-size:15px;color:#6b7280;line-height:1.6;margin:0 0 20px;">
      <strong style="color:#1a3a2a;">${businessName}</strong> has been approved and is now live in the District 1921 directory.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="background:#c9a84c;border-radius:6px;">
          <a href="${url}" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:600;color:#1a3a2a;text-decoration:none;">
            View Your Listing →
          </a>
        </td>
      </tr>
    </table>
    <p style="font-size:14px;color:#6b7280;line-height:1.6;margin:0 0 6px;"><strong style="color:#1a3a2a;">Make the most of your listing:</strong></p>
    <ul style="font-size:14px;color:#6b7280;line-height:1.8;margin:0 0 28px;padding-left:20px;">
      <li>Upgrade to a Professional Page to unlock photos, hours, deals &amp; analytics</li>
      <li>Apply for Gold Shield verification — earned, not purchased</li>
      <li>Share your listing with your community</li>
    </ul>
    <table cellpadding="0" cellspacing="0">
      <tr>
        <td style="background:#1a3a2a;border-radius:6px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display:inline-block;padding:12px 28px;font-size:13px;font-weight:600;color:#ffffff;text-decoration:none;">
            Go to Dashboard →
          </a>
        </td>
      </tr>
    </table>
  `)
}

// ─── Dunning: Payment Failed (Day 1) ─────────────────────────────────────────

export async function sendPaymentFailed(to: string, businessName: string, retryDate: string) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Action needed — payment failed for ${businessName}`,
    html: wrap(`
      <h1 style="font-family:Georgia,serif;font-size:26px;font-weight:700;color:#1a3a2a;margin:0 0 8px;">
        We couldn't process your payment.
      </h1>
      <p style="font-size:15px;color:#6b7280;line-height:1.6;margin:0 0 20px;">
        Your Professional Page for <strong style="color:#1a3a2a;">${businessName}</strong> is still active, but we weren't able to process your last payment.
      </p>
      <div style="background:#fdecea;border-left:4px solid #c62828;border-radius:4px;padding:16px 20px;margin-bottom:28px;">
        <p style="margin:0;font-size:14px;color:#8B2020;line-height:1.6;">
          We'll automatically retry on <strong>${retryDate}</strong>. If the payment fails again, your page will be downgraded to a free listing.
        </p>
      </div>
      <p style="font-size:14px;color:#6b7280;line-height:1.6;margin:0 0 24px;">
        Please update your payment method to keep your Professional Page active — including your contact info, photos, deals, events, and community leads.
      </p>
      <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr>
          <td style="background:#c9a84c;border-radius:6px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing" style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:600;color:#1a3a2a;text-decoration:none;">
              Update Payment Method →
            </a>
          </td>
        </tr>
      </table>
      <hr style="border:none;border-top:1px solid #e5e0d5;margin:24px 0;" />
      <p style="font-size:12px;color:#b0a898;margin:0;">
        Questions? Reply to this email or visit your dashboard. We're here to help.
      </p>
    `),
  })
}

// ─── Dunning: Final Warning (Day 5) ──────────────────────────────────────────

export async function sendPaymentFinalWarning(to: string, businessName: string) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Final notice — ${businessName} will be downgraded tomorrow`,
    html: wrap(`
      <h1 style="font-family:Georgia,serif;font-size:26px;font-weight:700;color:#1a3a2a;margin:0 0 8px;">
        Last chance to keep your Professional Page.
      </h1>
      <p style="font-size:15px;color:#6b7280;line-height:1.6;margin:0 0 20px;">
        We've made multiple attempts to process payment for <strong style="color:#1a3a2a;">${businessName}</strong>. Without a valid payment method, your page will be downgraded to a free listing <strong style="color:#c62828;">tomorrow</strong>.
      </p>
      <div style="background:#fdecea;border-left:4px solid #c62828;border-radius:4px;padding:16px 20px;margin-bottom:28px;">
        <p style="font-size:14px;color:#8B2020;margin:0 0 8px;font-weight:700;">You'll lose access to:</p>
        <ul style="margin:0;padding-left:20px;font-size:13px;color:#8B2020;line-height:1.8;">
          <li>Contact info visible to customers</li>
          <li>Photos, logo, and full business profile</li>
          <li>Deals and events posting</li>
          <li>Community leads and request board replies</li>
          <li>Analytics dashboard</li>
          <li>Gold Shield status (if applicable)</li>
        </ul>
      </div>
      <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr>
          <td style="background:#c62828;border-radius:6px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing" style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">
              Update Payment Now →
            </a>
          </td>
        </tr>
      </table>
      <p style="font-size:13px;color:#b0a898;margin:0;">
        You can reactivate at any time from your dashboard. Your listing data is saved.
      </p>
    `),
  })
}

// ─── Dunning: Subscription Cancelled / Downgraded ────────────────────────────

export async function sendSubscriptionCancelled(to: string, businessName: string) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `${businessName} has been downgraded to a free listing`,
    html: wrap(`
      <h1 style="font-family:Georgia,serif;font-size:26px;font-weight:700;color:#1a3a2a;margin:0 0 8px;">
        Your Professional Page has been downgraded.
      </h1>
      <p style="font-size:15px;color:#6b7280;line-height:1.6;margin:0 0 20px;">
        Due to payment failure, <strong style="color:#1a3a2a;">${businessName}</strong> has been downgraded to a free listing. Your business is still in the directory — customers can still find you by name and category.
      </p>
      <p style="font-size:14px;color:#6b7280;line-height:1.6;margin:0 0 24px;">
        Reactivate anytime to restore your full profile, contact info, photos, deals, events, and community leads. Your data has been saved.
      </p>
      <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr>
          <td style="background:#1a3a2a;border-radius:6px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing" style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">
              Reactivate for $15/mo →
            </a>
          </td>
        </tr>
      </table>
      <hr style="border:none;border-top:1px solid #e5e0d5;margin:24px 0;" />
      <p style="font-size:12px;color:#b0a898;margin:0;">
        We appreciate your support of District 1921 and the community. We hope to have you back soon.
      </p>
    `),
  })
}

export async function sendMonthlySummary({
  to, businessName, period, stats, dashboardUrl,
}: {
  to: string; businessName: string; period: string
  stats: { views: number; checkins: number; follows: number; shares: number; clicks: number }
  dashboardUrl: string
}) {
  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: 'District 1921 <hello@mail.district1921.com>',
    to,
    subject: `📊 Your ${period} Summary — ${businessName}`,
    html: `
      <div style="font-family:'DM Sans',sans-serif;max-width:560px;margin:0 auto;background:#faf7f0;padding:32px">
        <div style="background:#1a3a2a;padding:24px 32px;border-radius:12px 12px 0 0;text-align:center">
          <h1 style="font-family:'Playfair Display',serif;color:#c9a84c;margin:0;font-size:22px">District 1921</h1>
          <p style="color:rgba(255,255,255,0.65);font-size:13px;margin:4px 0 0">Monthly Business Summary</p>
        </div>
        <div style="background:#fff;padding:28px 32px;border:1px solid #e5e0d5;border-top:none">
          <h2 style="font-family:'Playfair Display',serif;color:#1a3a2a;font-size:20px;margin:0 0 4px">${businessName}</h2>
          <p style="color:#6b7280;font-size:13px;margin:0 0 24px">${period}</p>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:24px">
            ${[
              { label: 'Profile Views', val: stats.views, icon: '👁' },
              { label: 'Check-ins', val: stats.checkins, icon: '📍' },
              { label: 'New Followers', val: stats.follows, icon: '♡' },
              { label: 'Shares', val: stats.shares, icon: '↗' },
              { label: 'Link Clicks', val: stats.clicks, icon: '🔗' },
            ].map(s => `
              <div style="background:#faf7f0;border:1px solid #e5e0d5;border-radius:8px;padding:14px;text-align:center">
                <div style="font-size:20px;margin-bottom:4px">${s.icon}</div>
                <div style="font-size:22px;font-weight:700;color:#1a3a2a">${s.val}</div>
                <div style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em">${s.label}</div>
              </div>
            `).join('')}
          </div>
          <a href="${dashboardUrl}" style="display:block;background:#1a3a2a;color:#fff;text-align:center;padding:14px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">
            View Full Analytics Dashboard →
          </a>
        </div>
        <p style="color:#b0a898;font-size:11px;text-align:center;margin-top:16px">District 1921 · Community Business Directory</p>
      </div>
    `,
  })
}

export async function sendSpotlightBlast({
  to, businessName, businessSlug, blurb, logoUrl,
}: {
  to: string; businessName: string; businessSlug: string; blurb: string; logoUrl?: string
}) {
  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: 'District 1921 <hello@mail.district1921.com>',
    to,
    subject: `⭐ This Week's Community Spotlight — ${businessName}`,
    html: `
      <div style="font-family:'DM Sans',sans-serif;max-width:560px;margin:0 auto;background:#faf7f0;padding:32px">
        <div style="background:linear-gradient(135deg,#1a3a2a,#2d6a4f);padding:32px;border-radius:12px 12px 0 0;text-align:center">
          <p style="color:rgba(255,255,255,0.6);font-size:11px;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 8px">District 1921 · Weekly Spotlight</p>
          <h1 style="font-family:'Playfair Display',serif;color:#c9a84c;margin:0;font-size:28px;font-weight:900">Community Spotlight</h1>
        </div>
        <div style="background:#fff;padding:32px;border:1px solid #e5e0d5;border-top:none;text-align:center">
          ${logoUrl ? `<img src="${logoUrl}" style="width:80px;height:80px;border-radius:12px;object-fit:cover;margin:0 auto 16px;display:block;border:3px solid #c9a84c" />` : ''}
          <h2 style="font-family:'Playfair Display',serif;color:#1a3a2a;font-size:24px;margin:0 0 12px">${businessName}</h2>
          <p style="color:#4a4540;font-size:15px;line-height:1.7;margin:0 0 24px">${blurb}</p>
          <a href="https://district1921.com/business/${businessSlug}" style="display:inline-block;background:#c9a84c;color:#1a3a2a;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">
            View This Business →
          </a>
        </div>
        <p style="color:#b0a898;font-size:11px;text-align:center;margin-top:16px">District 1921 · Community Business Directory · <a href="https://district1921.com" style="color:#b0a898">district1921.com</a></p>
      </div>
    `,
  })
}

export async function sendReferralCredit({
  to, creditAmount, referralName,
}: {
  to: string; creditAmount: number; referralName: string
}) {
  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: 'District 1921 <hello@mail.district1921.com>',
    to,
    subject: `🎉 You earned a referral credit — $${(creditAmount / 100).toFixed(0)} off your next renewal`,
    html: `
      <div style="font-family:'DM Sans',sans-serif;max-width:560px;margin:0 auto;background:#faf7f0;padding:32px">
        <div style="background:#1a3a2a;padding:24px 32px;border-radius:12px 12px 0 0;text-align:center">
          <h1 style="font-family:'Playfair Display',serif;color:#c9a84c;margin:0;font-size:22px">District 1921</h1>
        </div>
        <div style="background:#fff;padding:32px;border:1px solid #e5e0d5;border-top:none;text-align:center">
          <div style="font-size:48px;margin-bottom:16px">🎉</div>
          <h2 style="font-family:'Playfair Display',serif;color:#1a3a2a;font-size:22px;margin:0 0 8px">You earned a referral credit!</h2>
          <p style="color:#6b7280;font-size:14px;margin:0 0 20px">${referralName} just joined District 1921 using your referral link.</p>
          <div style="background:#faf7f0;border:2px solid #c9a84c;border-radius:12px;padding:20px;margin-bottom:24px;display:inline-block">
            <div style="font-size:36px;font-weight:900;color:#1a3a2a">$${(creditAmount / 100).toFixed(0)}</div>
            <div style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.1em">Credit Applied</div>
          </div>
          <p style="color:#6b7280;font-size:13px">Your credit will be applied automatically at your next billing renewal.</p>
        </div>
      </div>
    `,
  })
}

export async function sendSuggestionNotification({
  businessName, businessCity, suggesterEmail,
}: {
  businessName: string; businessCity: string; suggesterEmail?: string
}) {
  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: 'District 1921 <hello@mail.district1921.com>',
    to: 'mrfgrant@protonmail.com',
    subject: `📬 New Business Suggestion: ${businessName}`,
    html: `
      <div style="font-family:'DM Sans',sans-serif;max-width:540px;margin:0 auto;padding:32px;background:#faf7f0">
        <div style="background:#1a3a2a;padding:20px 28px;border-radius:10px 10px 0 0">
          <h1 style="font-family:'Playfair Display',serif;color:#c9a84c;margin:0;font-size:20px">New Business Suggestion</h1>
        </div>
        <div style="background:#fff;border:1px solid #e5e0d5;border-top:none;padding:24px 28px;border-radius:0 0 10px 10px">
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;width:120px">Business</td><td style="padding:8px 0;font-weight:600;color:#1a3a2a;font-size:14px">${businessName}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:13px">Location</td><td style="padding:8px 0;color:#1a3a2a;font-size:13px">${businessCity || 'Not provided'}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:13px">Suggested by</td><td style="padding:8px 0;color:#1a3a2a;font-size:13px">${suggesterEmail || 'Anonymous'}</td></tr>
          </table>
          <a href="https://district1921.com/admin/suggestions" style="display:inline-block;margin-top:16px;background:#c9a84c;color:#1a3a2a;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:700;font-size:13px">Review in Admin →</a>
        </div>
      </div>
    `,
  })
}

export async function sendSuggestionConfirmation({
  to, businessName,
}: {
  to: string; businessName: string
}) {
  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: 'District 1921 <hello@mail.district1921.com>',
    to,
    subject: `Thanks for suggesting ${businessName}`,
    html: `
      <div style="font-family:'DM Sans',sans-serif;max-width:540px;margin:0 auto;padding:32px;background:#faf7f0">
        <div style="background:#1a3a2a;padding:20px 28px;border-radius:10px 10px 0 0;text-align:center">
          <h1 style="font-family:'Playfair Display',serif;color:#c9a84c;margin:0;font-size:22px">District 1921</h1>
        </div>
        <div style="background:#fff;border:1px solid #e5e0d5;border-top:none;padding:32px 28px;border-radius:0 0 10px 10px;text-align:center">
          <div style="font-size:40px;margin-bottom:12px">🙏</div>
          <h2 style="font-family:'Playfair Display',serif;color:#1a3a2a;font-size:20px;margin:0 0 8px">Thank you!</h2>
          <p style="color:#4a4540;font-size:14px;line-height:1.7;margin:0 0 20px">
            We received your suggestion for <strong>${businessName}</strong>. Our team will research the business, reach out to the owner, and add them to the directory before launch.
          </p>
          <p style="color:#6b7280;font-size:13px">The community grows one business at a time. We appreciate you helping build District 1921.</p>
        </div>
      </div>
    `,
  })
}

export async function sendOwnerOutreach({
  to, businessName, businessCity, suggesterEmail,
}: {
  to: string; businessName: string; businessCity?: string; suggesterEmail?: string
}) {
  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)
  const claimUrl = `${process.env.NEXT_PUBLIC_APP_URL}/login?next=/onboarding&ref=suggestion`
  await resend.emails.send({
    from: 'District 1921 <hello@mail.district1921.com>',
    to,
    subject: `${businessName} has been recommended on District 1921`,
    html: `
      <div style="font-family:'DM Sans',sans-serif;max-width:560px;margin:0 auto;background:#faf7f0;padding:32px">
        <div style="background:linear-gradient(135deg,#1a3a2a,#2d6a4f);padding:28px 32px;border-radius:12px 12px 0 0;text-align:center">
          <h1 style="font-family:'Playfair Display',serif;color:#c9a84c;margin:0 0 4px;font-size:24px;font-weight:900">District 1921</h1>
          <p style="color:rgba(255,255,255,0.65);font-size:12px;margin:0;letter-spacing:0.1em;text-transform:uppercase">The Community Business Directory</p>
        </div>
        <div style="background:#fff;border:1px solid #e5e0d5;border-top:none;padding:32px;border-radius:0 0 12px 12px">
          <h2 style="font-family:'Playfair Display',serif;color:#1a3a2a;font-size:22px;margin:0 0 16px;line-height:1.3">
            Your business was recommended by the community.
          </h2>
          <p style="color:#4a4540;font-size:14px;line-height:1.75;margin:0 0 12px">
            Someone in the District 1921 community suggested that <strong>${businessName}</strong>${businessCity ? ` in ${businessCity}` : ''} be listed in our directory — and we agree.
          </p>
          ${suggesterEmail ? `<p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0 0 20px;padding:12px 16px;background:#faf7f0;border-left:3px solid #c9a84c;border-radius:0 6px 6px 0;">Suggested by: <strong>${suggesterEmail}</strong></p>` : ''}
          <p style="color:#4a4540;font-size:14px;line-height:1.75;margin:0 0 24px">
            District 1921 is a nationwide directory built to connect the community with businesses like yours. Listing is <strong>free</strong> — and if you want a full business page with photos, hours, and analytics, you can upgrade at any time.
          </p>

          <div style="background:#faf7f0;border:1px solid #e5e0d5;border-radius:10px;padding:20px;margin-bottom:24px">
            <p style="font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px">What you get — free listing includes:</p>
            <div style="display:flex;flex-direction:column;gap:8px">
              ${['Your business name, category, and city in search results', 'A dedicated business page at district1921.com', 'Community check-ins, follows, and shares', 'One-click upgrade to a full Pro Page any time'].map(item => `
              <div style="display:flex;align-items:flex-start;gap:10px">
                <span style="color:#2d6a4f;font-size:16px;flex-shrink:0;margin-top:-1px">✓</span>
                <span style="font-size:13px;color:#4a4540">${item}</span>
              </div>`).join('')}
            </div>
          </div>

          <a href="${claimUrl}" style="display:block;background:#c9a84c;color:#1a3a2a;text-align:center;padding:16px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;margin-bottom:16px">
            Claim Your Free Listing →
          </a>
          <p style="color:#b0a898;font-size:11px;text-align:center;margin:0">
            If this email was sent in error or you'd prefer not to be listed, simply ignore it — no action needed.
          </p>
        </div>
        <p style="color:#b0a898;font-size:11px;text-align:center;margin-top:16px">
          District 1921 · Community Business Directory · <a href="https://district1921.com" style="color:#b0a898">district1921.com</a>
        </p>
      </div>
    `,
  })
}
