'use client'

import { motion } from 'framer-motion'
import { CheckIcon, CalendarIcon, ClockIcon, SparklesIcon, WhatsAppIcon } from '../Icons'
import { formatCurrency, formatDateLong, formatTime } from '@/utils'

export default function BookingSuccess({ settings, date, time, customer, onReset }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: 'spring' }}
      className="w-full max-w-xl mx-auto"
    >
      <div className="card relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-gold-500/20 rounded-full blur-3xl" />

        <div className="relative text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2, bounce: 0.4 }}
            className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-gold-500 to-champagne-500 flex items-center justify-center shadow-gold-glow"
          >
            <CheckIcon className="w-12 h-12 text-dark-900" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="font-serif text-3xl font-bold text-white mb-2"
          >
            <span className="gold-gradient-text">¡Reserva enviada!</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="text-gray-400 mb-8 max-w-sm mx-auto"
          >
            Recibimos tu reserva y comprobante. La dueña lo verificará y te confirmará por WhatsApp. 💕
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="glass-strong rounded-3xl p-5 mb-6 text-left"
          >
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/5">
              <SparklesIcon className="w-5 h-5 text-gold-400" />
              <h3 className="font-medium text-white">Detalle del turno</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-5 h-5 text-gold-400 flex-shrink-0" />
                <div>
                  <div className="text-xs text-gray-500">Fecha</div>
                  <div className="text-white capitalize font-medium text-sm">{formatDateLong(date)}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ClockIcon className="w-5 h-5 text-gold-400 flex-shrink-0" />
                <div>
                  <div className="text-xs text-gray-500">Hora</div>
                  <div className="text-white font-medium text-sm">{formatTime(time)} hs</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <WhatsAppIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                <div>
                  <div className="text-xs text-gray-500">Cliente</div>
                  <div className="text-white font-medium text-sm">
                    {customer?.customer_name} {customer?.customer_last_name}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-3 text-sm">
              <div className="bg-dark-800/60 rounded-2xl p-3">
                <div className="text-gray-500 text-xs mb-0.5">Seña abonada</div>
                <div className="text-gold-400 font-bold">{formatCurrency(settings?.deposit_amount)}</div>
              </div>
              <div className="bg-dark-800/60 rounded-2xl p-3">
                <div className="text-gray-500 text-xs mb-0.5">Saldo restante</div>
                <div className="text-white font-bold">{formatCurrency(Number(settings?.service_price) - Number(settings?.deposit_amount))}</div>
              </div>
            </div>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onReset}
            className="btn-outline w-full"
          >
            Reservar otro turno
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
