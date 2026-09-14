'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { getReservations, updateReservationStatus } from '@/services/reservations'
import { supabase } from '@/lib/supabase/client'
import {
  formatCurrency, formatDate, formatTime, getTodayISO, getStatusLabel, getStatusColorClass, cn,
} from '@/utils'
import {
  CalendarIcon, ClockIcon, UserIcon, SparklesIcon, MoneyIcon, CheckIcon,
} from '@/components/Icons'

const StatusBadge = ({ status }) => (
  <span className={cn(
    'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border',
    getStatusColorClass(status),
  )}>
    {getStatusLabel(status)}
  </span>
)

export default function DashboardHome() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)

  const loadReservations = async () => {
    try {
      const data = await getReservations({ fromDate: getTodayISO() })
      setReservations(data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReservations()
    const channel = supabase
      .channel('reservations-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reservations' },
        () => loadReservations()
      )
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const today = getTodayISO()
  const todayCount = reservations.filter((r) => r.date === today && r.status !== 'cancelled').length
  const pendingCount = reservations.filter((r) => r.status === 'pending').length
  const confirmedCount = reservations.filter((r) => r.status === 'confirmed').length
  const depositTotal = reservations
    .filter((r) => ['confirmed', 'completed'].includes(r.status))
    .reduce((acc, r) => acc + Number(r.deposit_amount), 0)

  const stats = [
    { label: 'Turnos de hoy', value: todayCount, icon: CalendarIcon, color: 'from-blue-500/20 to-blue-500/5', text: 'text-blue-400' },
    { label: 'Pendientes', value: pendingCount, icon: ClockIcon, color: 'from-yellow-500/20 to-yellow-500/5', text: 'text-yellow-400' },
    { label: 'Confirmados', value: confirmedCount, icon: CheckIcon, color: 'from-emerald-500/20 to-emerald-500/5', text: 'text-emerald-400' },
    { label: 'Ingresos señas', value: formatCurrency(depositTotal), icon: MoneyIcon, color: 'from-gold-500/20 to-champagne-500/5', text: 'text-gold-400' },
  ]

  const upcoming = [...reservations]
    .filter((r) => r.status !== 'cancelled')
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date)
      return a.time.localeCompare(b.time)
    })
    .slice(0, 10)

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-white mb-1">Panel principal</h1>
        <p className="text-gray-400 text-sm">Gestioná tus reservas y turnos</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => {
          const Icon = s.icon
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn('card relative overflow-hidden')}
            >
              <div className={cn('absolute -top-8 -right-8 w-28 h-28 rounded-full bg-gradient-to-br blur-2xl opacity-60', s.color)} />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn('w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center', s.text)}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{s.value}</div>
                <div className="text-sm text-gray-400">{s.label}</div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-serif text-xl font-semibold text-white mb-1">Próximos turnos</h2>
            <p className="text-gray-500 text-sm">Los turnos más recientes</p>
          </div>
          <Link href="/dashboard/agenda" className="btn-outline text-sm py-2 px-4 rounded-xl">
            Ver agenda
          </Link>
        </div>

        {loading ? (
          <div className="py-10 text-center text-gray-500">Cargando...</div>
        ) : upcoming.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 mx-auto mb-4 flex items-center justify-center">
              <SparklesIcon className="w-8 h-8 text-gray-600" />
            </div>
            <div className="text-white font-medium mb-1">No hay turnos próximos</div>
            <div className="text-gray-500 text-sm">Las reservas aparecerán acá</div>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <div className="min-w-[640px]">
              <div className="grid grid-cols-12 px-4 md:px-0 py-2 text-xs text-gray-500 uppercase tracking-wider border-b border-white/5">
                <div className="col-span-3">Cliente</div>
                <div className="col-span-3">Servicio</div>
                <div className="col-span-2">Fecha</div>
                <div className="col-span-1">Hora</div>
                <div className="col-span-1">Seña</div>
                <div className="col-span-2 text-right">Estado</div>
              </div>
              <AnimatePresence initial={false}>
                {upcoming.map((r, idx) => (
                  <Link
                    key={r.id}
                    href={`/dashboard/reserva/${r.id}`}
                    className="grid grid-cols-12 items-center px-4 md:px-0 py-4 border-b border-white/5 hover:bg-white/[0.03] transition-colors group"
                  >
                    <div className="col-span-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-500/20 to-champagne-500/20 border border-gold-500/20 flex items-center justify-center flex-shrink-0">
                          <UserIcon className="w-4 h-4 text-gold-400" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-white text-sm font-medium truncate">
                            {r.customer_name} {r.customer_last_name}
                          </div>
                          <div className="text-gray-500 text-xs truncate">{r.whatsapp}</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-3 text-sm text-gray-300 truncate">{r.service}</div>
                    <div className="col-span-2 text-sm text-gray-300">{formatDate(r.date)}</div>
                    <div className="col-span-1 text-sm text-gray-300">{formatTime(r.time)}</div>
                    <div className="col-span-1 text-sm text-gold-400 font-medium">{formatCurrency(r.deposit_amount)}</div>
                    <div className="col-span-2 flex justify-end">
                      <StatusBadge status={r.status} />
                    </div>
                  </Link>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
