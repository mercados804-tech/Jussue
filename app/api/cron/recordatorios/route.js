import { NextResponse } from 'next/server'
import { sendTextMessage, buildReminder24hText, buildReminder1hText } from '@/services/whatsapp'
import { createNotification } from '@/services/business'
import { createServerSupabase } from '@/lib/supabase/client'
import { formatDateLong, formatTime } from '@/utils'

export const dynamic = 'force-dynamic'

function getDateTimeParts(dateStr, timeStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const [h, min] = (timeStr || '00:00').split(':').map(Number)
  return new Date(y, (m || 1) - 1, d || 1, h || 0, min || 0)
}

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const key = searchParams.get('key')
  if (key !== process.env.CRON_SECRET && process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerSupabase()
  const now = new Date()
  const results = { reminder_24h: 0, reminder_1h: 0, errors: 0 }

  try {
    const { data: reservations, error } = await supabase
      .from('reservations')
      .select('id, whatsapp, service, date, time, status')
      .in('status', ['confirmed'])

    if (error) throw error
    if (!reservations) return NextResponse.json({ ok: true, results })

    for (const r of reservations) {
      const turnDate = getDateTimeParts(r.date, r.time)
      const diffMs = turnDate.getTime() - now.getTime()
      const diffHours = diffMs / (1000 * 60 * 60)

      const n24key = `${r.id}_reminder_24h`
      const n1key = `${r.id}_reminder_1h`

      try {
        if (diffHours > 23 && diffHours < 25) {
          const { data: exist } = await supabase
            .from('notifications')
            .select('id')
            .eq('reservation_id', r.id)
            .eq('type', 'reminder_24h')
            .limit(1)
            .maybeSingle()
          if (!exist) {
            const txt = buildReminder24hText(r.service, formatDateLong(r.date), formatTime(r.time))
            const sent = await sendTextMessage(r.whatsapp, txt)
            await createNotification({
              reservation_id: r.id,
              type: 'reminder_24h',
              status: sent.success ? 'sent' : 'failed',
              sent_at: sent.success ? new Date().toISOString() : null,
              error: sent.error || null,
            })
            if (sent.success) results.reminder_24h++
            else results.errors++
          }
        }
      } catch (e) {
        console.error('24h error', r.id, e)
        results.errors++
      }

      try {
        if (diffHours > 0.75 && diffHours < 1.25) {
          const { data: exist } = await supabase
            .from('notifications')
            .select('id')
            .eq('reservation_id', r.id)
            .eq('type', 'reminder_1h')
            .limit(1)
            .maybeSingle()
          if (!exist) {
            const txt = buildReminder1hText(formatTime(r.time))
            const sent = await sendTextMessage(r.whatsapp, txt)
            await createNotification({
              reservation_id: r.id,
              type: 'reminder_1h',
              status: sent.success ? 'sent' : 'failed',
              sent_at: sent.success ? new Date().toISOString() : null,
              error: sent.error || null,
            })
            if (sent.success) results.reminder_1h++
            else results.errors++
          }
        }
      } catch (e) {
        console.error('1h error', r.id, e)
        results.errors++
      }
    }

    return NextResponse.json({ ok: true, results, ts: now.toISOString() })
  } catch (e) {
    console.error('Reminders error:', e)
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
