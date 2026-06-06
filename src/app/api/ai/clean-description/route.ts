import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { description, businessName } = await req.json()
  if (!description) return NextResponse.json({ error: 'Missing description' }, { status: 400 })

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `You are helping a business owner write a professional business description for a community business directory.

Business name: ${businessName}

Original description:
${description}

Rewrite this description to be:
- Professional and polished, but warm and community-oriented
- Clear about what the business offers and who it serves
- Free of grammar errors, typos, and awkward phrasing
- 2-4 paragraphs maximum
- Written in third person or first person — match the original voice
- Do NOT add fake details, claims, or information not in the original
- Do NOT add phrases like "we are proud to" or "we are committed to" — keep it genuine
- Do NOT include any commentary or explanation, just the cleaned description

Return ONLY the cleaned description text, nothing else.`,
      }],
    }),
  })

  if (!response.ok) {
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 500 })
  }

  const data = await response.json()
  const cleaned = data.content?.[0]?.text?.trim()

  if (!cleaned) {
    return NextResponse.json({ error: 'No response from AI' }, { status: 500 })
  }

  return NextResponse.json({ cleaned })
}
