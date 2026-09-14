'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from '../Icons'
import {
  getMonthNames, getShortDayNames, isSameDay, toISODate, addDays, getTodayISO, cn,
} from '@/utils'

export default function DatePicker({ schedules, blockedDates, selectedDate, onSelectDate, onBack }) {
  const today = new Date()
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d
  })

  const monthNames = getMonthNames()
  const shortDays = getShortDayNames()

  const activeDays = useMemo(() => {
    const map = {}
    schedules.forEach((s) => {
      if (s.active) map[s.day_of_week] = true
    })
    return map
  }, [schedules])

  const blockedSet = useMemo(() => {
    const s = new Set()
    blockedDates.forEach((b) => s.add(b.date))
    return s
  }, [blockedDates])

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const startDow = firstDay.getDay()
    const lastDate = new Date(year, month + 1, 0).getDate()

    const days = []
    for (let i = 0; i < startDow; i++) days.push(null)
    for (let d = 1; d <= lastDate; d++) {
      days.push(new Date(year, month, d))
    }
    return days
  }, [viewDate])

  const isDisabled = (date) => {
    if (!date) return true
    const iso = toISODate(date)
    const todayISO = getTodayISO()
    if (iso < todayISO) return true
    if (blockedSet.has(iso)) return true
    const dow = date.getDay()
    if (!activeDays[dow]) return true
    return false
  }

  const goPrev = () => {
    const d = new Date(viewDate)
    d.setMonth(d.getMonth() - 1)
    const minMonth = new Date()
    if (d.getFullYear() < minMonth.getFullYear() ||
        (d.getFullYear() === minMonth.getFullYear() && d.getMonth() < minMonth.getMonth())) {
      return
    }
    setViewDate(d)
  }

  const goNext = () => {
    const d = new Date(viewDate)
    d.setMonth(d.getMonth() + 1)
    setViewDate(d)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-xl mx-auto"
    >
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="p-2 rounded-xl hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="font-serif text-xl font-semibold text-white">Elige fecha</h2>
          <div className="w-9" />
        </div>

        <div className="flex items-center justify-between mb-5 px-2">
          <button
            onClick={goPrev}
            className="p-2 rounded-xl hover:bg-white/5 transition-colors text-gray-300"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="font-serif text-lg font-medium text-white">
            {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
          </div>
          <button
            onClick={goNext}
            className="p-2 rounded-xl hover:bg-white/5 transition-colors text-gray-300"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
          {shortDays.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">
              {d}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${viewDate.getMonth()}-${viewDate.getFullYear()}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-7 gap-1 md:gap-2"
          >
            {calendarDays.map((date, idx) => {
              if (!date) return <div key={idx} />
              const disabled = isDisabled(date)
              const selected = isSameDay(date, selectedDate)
              const today = isSameDay(date, new Date())
              return (
                <button
                  key={idx}
                  disabled={disabled}
                  onClick={() => onSelectDate(toISODate(date))}
                  className={cn(
                    'aspect-square rounded-2xl text-sm md:text-base font-medium transition-all duration-200 flex items-center justify-center relative',
                    disabled && 'opacity-25 cursor-not-allowed',
                    !disabled && !selected && !today && 'hover:bg-gold-500/10 text-gray-200 hover:text-gold-400',
                    today && !selected && !disabled && 'text-gold-400 bg-gold-500/5',
                    selected && 'bg-gradient-to-br from-gold-500 to-champagne-500 text-dark-900 shadow-gold-glow font-bold',
                  )}
                >
                  {date.getDate()}
                  {today && !selected && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-gold-400" />
                  )}
                </button>
              )
            })}
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 pt-5 border-t border-white/5 flex flex-wrap gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gradient-to-br from-gold-500 to-champagne-500" />
            Seleccionado
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gold-500/20 ring-1 ring-gold-500/50" />
            Hoy
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-white/10" />
            No disponible
          </div>
        </div>
      </div>
    </motion.div>
  )
}
