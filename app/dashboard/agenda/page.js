'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { getReservations } from '@/services/reservations'
import { supabase } from '@/lib/supabase/client'
import {
  formatDate, formatTime, getDayOfWeekNames, getMonthNames, getShortDayNames,
  getStartOfWeek, getEndOfWeek, startOfMonth, endOfMonth, addDays, toISODate,
  getStatusColorClass, getStatusLabel, cn,
} from '@/utils'
import {
  ChevronLeft, ChevronRight, UserIcon, CalendarIcon,
} from '@/components/Icons'

const VIEWS = [
  { id: 'day', label: 'Día' },
  { id: 'week', label: 'Semana' },
  { id: 'month', label: 'Mes' },
]

const DAY_HOURS = Array.from({ length: 12 }, (_, i) => `${String(9 + i).padStart(2, '0')}:00`)

export default function AgendaPage() {
  const [view, setView] = useState('week')
  const [cursor, setCursor] = useState(new Date())
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      let from, to
      if (view === 'day') { from = toISODate(cursor); to = from }
      else if (view === 'week') {
        from = toISODate(getStartOfWeek(cursor))
        to = toISODate(getEndOfWeek(cursor))
      } else {
        from = toISODate(startOfMonth(cursor))
        to = toISODate(endOfMonth(cursor))
      }
      const data = await getReservations({ fromDate: from, toDate: to })
      setReservations(data || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [view, cursor])

  useEffect(() => {
    const ch = supabase.channel('agenda-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, () => load())
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [view, cursor])

  const goPrev = () => {
    const d = new Date(cursor)
    if (view === 'day') d.setDate(d.getDate() - 1)
    else if (view === 'week') d.setDate(d.getDate() - 7)
    else d.setMonth(d.getMonth() - 1)
    setCursor(d)
  }

  const goNext = () => {
    const d = new Date(cursor)
    if (view === 'day') d.setDate(d.getDate() + 1)
    else if (view === 'week') d.setDate(d.getDate() + 7)
    else d.setMonth(d.getMonth() + 1)
    setCursor(d)
  }

  const goToday = () => setCursor(new Date())

  const headerLabel = useMemo(() => {
    if (view === 'day') return cursor.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    if (view === 'week') {
      const s = getStartOfWeek(cursor), e = getEndOfWeek(cursor)
      return `${s.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })} - ${e.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}`
    }
    return cursor.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
  }, [view, cursor])

  const byDate = useMemo(() => {
    const m = {}
    reservations.forEach((r) => {
      if (!m[r.date]) m[r.date] = []
      m[r.date].push(r)
    })
    Object.values(m).forEach((arr) => arr.sort((a, b) => a.time.localeCompare(b.time)))
    return m
  }, [reservations])

  const renderDayView = () => {
    const key = toISODate(cursor)
    const list = byDate[key] || []
    return (
      <div className="space-y-3">
        {DAY_HOURS.map((h) => {
          const inHour = list.filter((r) => r.time.startsWith(h.slice(0, 2)))
          return (
            <div key={h} className="grid grid-cols-[70px_1fr] gap-3 items-start">
              <div className="text-xs text-gray-500 pt-3 font-medium">{h}</div>
              <div className="min-h-[60px] border-l-2 border-white/10 pl-3 space-y-2">
                {inHour.length === 0 && <div className="h-[60px]" />}
                {inHour.map((r) => (
                  <Link
                    key={r.id}
                    href={`/dashboard/reserva/${r.id}`}
                    className={cn('block rounded-2xl p-3 border transition-all hover:scale-[1.01]', getStatusColorClass(r.status))}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-white font-semibold text-sm flex items-center gap-1.5">
                        <UserIcon className="w-3.5 h-3.5" />
                        {r.customer_name} {r.customer_last_name}
                      </div>
                      <div className="text-xs font-medium">{formatTime(r.time)}</div>
                    </div>
                    <div className="text-xs opacity-80">{r.service}</div>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderWeekView = () => {
    const start = getStartOfWeek(cursor)
    const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))
    const shortDays = getShortDayNames()
    return (
      <div className="grid grid-cols-7 gap-2 md:gap-3">
        {days.map((d, i) => {
          const key = toISODate(d)
          const list = byDate[key] || []
          const isToday = toISODate(new Date()) === key
          return (
            <div key={key} className="rounded-2xl bg-dark-900/60 border border-white/5 overflow-hidden">
              <div className={cn('p-3 text-center border-b border-white/5', isToday && 'bg-gold-500/10')}>
                <div className="text-xs text-gray-500 mb-0.5">{shortDays[d.getDay()]}</div>
                <div className={cn('text-lg font-bold', isToday ? 'text-gold-400' : 'text-white')}>
                  {d.getDate()}
                </div>
              </div>
              <div className="p-2 space-y-2 min-h-[320px] max-h-[520px] overflow-y-auto">
                {list.map((r) => (
                  <Link
                    key={r.id}
                    href={`/dashboard/reserva/${r.id}`}
                    className={cn('block rounded-xl p-2 text-xs border transition-all hover:scale-[1.02]', getStatusColorClass(r.status))}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-semibold">{formatTime(r.time)}</span>
                      <span className="text-[10px] uppercase tracking-wider">{getStatusLabel(r.status).slice(0, 3)}</span>
                    </div>
                    <div className="truncate font-medium">{r.customer_name}</div>
                  </Link>
                ))}
                {list.length === 0 && <div className="text-xs text-gray-700 text-center py-6">Sin turnos</div>}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderMonthView = () => {
    const monthNames = getMonthNames()
    const shortDays = getShortDayNames()
    const firstDow = new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay()
    const lastDate = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()
    const today = toISODate(new Date())
    const cells = []
    for (let i = 0; i < firstDow; i++) cells.push(null)
    for (let d = 1; d <= lastDate; d++) cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d))
    return (
      <div>
        <div className="grid grid-cols-7 mb-2">
          {shortDays.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {cells.map((d, i) => {
            if (!d) return <div key={i} />
            const key = toISODate(d)
            const list = byDate[key] || []
            const isToday = today === key
            return (
              <div
                key={key}
                className={cn(
                  'min-h-[90px] md:min-h-[120px] rounded-xl p-2 border',
                  isToday ? 'bg-gold-500/10 border-gold-500/30' : 'bg-dark-900/40 border-white/5',
                )}
              >
                <div className={cn('text-xs font-semibold mb-1', isToday ? 'text-gold-400' : 'text-gray-300')}>
                  {d.getDate()}
                </div>
                <div className="space-y-1">
                  {list.slice(0, 3).map((r) => (
                    <Link
                      key={r.id}
                      href={`/dashboard/reserva/${r.id}`}
                      className={cn('block rounded-lg px-1.5 py-1 text-[10px] truncate border', getStatusColorClass(r.status))}
                    >
                      {formatTime(r.time)} {r.customer_name}
                    </Link>
                  ))}
                  {list.length > 3 && (
                    <div className="text-[10px] text-gray-500 pl-1">+{list.length - 3} más</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white mb-1">Agenda</h1>
          <p className="text-gray-400 text-sm">Visualizá tus turnos</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="glass rounded-xl p-1 flex items-center">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  view === v.id ? 'bg-gold-500/15 text-gold-400' : 'text-gray-400 hover:text-white',
                )}
              >
                {v.label}
              </button>
            ))}
          </div>

          <div className="glass rounded-xl p-1 flex items-center">
            <button onClick={goPrev} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={goToday} className="px-3 py-2 text-xs font-medium text-gold-400 hover:text-gold-300">
              Hoy
            </button>
            <button onClick={goNext} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="card mb-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 mb-0.5 uppercase tracking-wider">Vista actual</div>
            <div className="font-serif text-xl text-white capitalize">{headerLabel}</div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full border status-pending">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" /> Pendiente
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full border status-confirmed">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Confirmado
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full border status-cancelled">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Cancelado
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full border status-completed">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Realizado
            </span>
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="py-16 text-center text-gray-500">Cargando agenda...</div>
        ) : view === 'day' ? renderDayView() : view === 'week' ? renderWeekView() : renderMonthView()}
      </div>
    </div>
  )
}
