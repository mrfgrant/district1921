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
