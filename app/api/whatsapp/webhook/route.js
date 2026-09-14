import { NextResponse } from 'next/server'
import { sendTextMessage, buildAutoReplyText } from '@/services/whatsapp'
import { createNotification } from '@/services/business'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN

  if (mode && token) {
    if (mode === 'subscribe' && token === verifyToken) {
      return new Response(challenge, { status: 200 })
    }
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return NextResponse.json({ ok: true })
}

export async function POST(req) {
  try {
    const body = await req.json()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
    const reserveUrl = `${appUrl}/reservar`

    const entry = body?.entry?.[0]
    const changes = entry?.changes?.[0]
    const messages = changes?.value?.messages
    const contacts = changes?.value?.contacts
    const businessName = changes?.value?.metadata?.display_name || 'Peluquería Alisados'

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ ok: true, skipped: true })
    }

    for (const msg of messages) {
      if (msg.type !== 'text') continue
      const from = msg.from
      const waId = contacts?.[0]?.wa_id || from

      try {
        await sendTextMessage(
          from,
          buildAutoReplyText(businessName, reserveUrl),
        )
      } catch (e) {
        console.error('Error auto-reply WhatsApp:', e)
      }

      try {
        await createNotification({
          reservation_id: null,
          type: 'auto_reply',
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
      } catch {}
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Webhook error:', e)
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
