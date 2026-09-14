'use client'

import { motion } from 'framer-motion'
import { formatDateLong, formatTime, cn } from '@/utils'
import { ChevronLeft, ClockIcon, CalendarIcon } from '../Icons'

export default function TimeSlots({ date, availableSlots, selectedTime, onSelectTime, onBack }) {
  const allUnavailable = availableSlots.length > 0 && availableSlots.every((s) => !s.available)
  const hasAnyAvailable = availableSlots.some((s) => s.available)

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
          <h2 className="font-serif text-xl font-semibold text-white">Elige horario</h2>
          <div className="w-9" />
        </div>

        <div className="glass-strong rounded-2xl p-4 mb-5 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gold-500/10 flex items-center justify-center flex-shrink-0">
            <CalendarIcon className="w-5 h-5 text-gold-400" />
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-0.5">Fecha seleccionada</div>
            <div className="text-white font-medium capitalize">{formatDateLong(date)}</div>
          </div>
        </div>

        {availableSlots.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 rounded-2xl bg-white/5 mx-auto mb-4 flex items-center justify-center">
              <ClockIcon className="w-8 h-8 text-gray-600" />
            </div>
            <div className="text-white font-medium mb-1">Sin horarios disponibles</div>
            <div className="text-gray-500 text-sm">Por favor, elige otro día.</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {availableSlots.map((slot, idx) => (
              <motion.button
                key={slot.time}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                disabled={!slot.available}
                onClick={() => slot.available && onSelectTime(slot.time)}
                whileHover={slot.available ? { scale: 1.03 } : {}}
                whileTap={slot.available ? { scale: 0.97 } : {}}
                className={cn(
                  'py-4 rounded-2xl font-semibold text-base transition-all duration-200 border',
                  !slot.available && 'bg-white/[0.03] border-white/5 text-gray-700 cursor-not-allowed line-through',
                  slot.available && !selectedTime && 'bg-dark-800/60 border-white/10 text-white hover:border-gold-500/30 hover:bg-gold-500/5',
                  selectedTime === slot.time && 'bg-gradient-to-br from-gold-500 to-champagne-500 text-dark-900 border-gold-400/50 shadow-gold-glow',
                  slot.available && selectedTime && selectedTime !== slot.time && 'opacity-70',
                )}
              >
                <div className="flex items-center justify-center gap-2">
                  <ClockIcon className={cn('w-4 h-4', selectedTime === slot.time ? 'text-dark-900' : slot.available ? 'text-gold-400' : 'text-gray-700')} />
                  {formatTime(slot.time)}
                </div>
              </motion.button>
            ))}
          </div>
        )}

        {!hasAnyAvailable && availableSlots.length > 0 && (
          <div className="mt-4 text-center text-xs text-gray-500">
            Todos los horarios están ocupados para este día.
          </div>
        )}
      </div>
    </motion.div>
  )
}
