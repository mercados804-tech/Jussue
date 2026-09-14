'use client'

import { motion } from 'framer-motion'
import { formatCurrency, formatDate, formatTime, formatDateLong } from '@/utils'
import { ChevronLeft, SparklesIcon, CalendarIcon, ClockIcon, UserIcon, ScissorsIcon } from '../Icons'

export default function BookingSummary({ settings, date, time, customer, onConfirm, onBack }) {
  if (!settings || !customer) return null

  const total = Number(settings.service_price)
  const deposit = Number(settings.deposit_amount)
  const remaining = total - deposit

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
          <h2 className="font-serif text-xl font-semibold text-white">Resumen de tu turno</h2>
          <div className="w-9" />
        </div>

        <div className="glass-strong rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
            <div className="w-11 h-11 rounded-xl bg-gold-500/10 flex items-center justify-center flex-shrink-0">
              <ScissorsIcon className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Servicio</div>
              <div className="text-white font-semibold">{settings.service_name}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-3 bg-dark-800/60 rounded-2xl p-3 border border-white/5">
              <CalendarIcon className="w-5 h-5 text-gold-400 flex-shrink-0" />
              <div>
                <div className="text-xs text-gray-500">Fecha</div>
                <div className="text-white font-medium text-sm capitalize">{formatDateLong(date)}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-dark-800/60 rounded-2xl p-3 border border-white/5">
              <ClockIcon className="w-5 h-5 text-gold-400 flex-shrink-0" />
              <div>
                <div className="text-xs text-gray-500">Hora</div>
                <div className="text-white font-medium text-sm">{formatTime(time)} hs</div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-dark-800/60 rounded-2xl p-3 border border-white/5">
            <UserIcon className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Cliente</div>
              <div className="text-white font-medium text-sm">
                {customer.customer_name} {customer.customer_last_name}
              </div>
              <div className="text-gray-400 text-xs mt-0.5">{customer.whatsapp}</div>
            </div>
          </div>
        </div>

        <div className="glass-strong rounded-2xl p-5 mb-6 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Precio total</span>
            <span className="text-white font-semibold">{formatCurrency(total)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Seña a pagar</span>
            <span className="text-gold-400 font-bold">{formatCurrency(deposit)}</span>
          </div>
          <div className="pt-3 border-t border-white/10 flex justify-between items-center">
            <span className="text-gray-300 font-medium">Saldo restante</span>
            <span className="text-white font-bold text-lg">{formatCurrency(remaining)}</span>
          </div>
        </div>

        <motion.button
          onClick={onConfirm}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full btn-gold flex items-center justify-center gap-2"
        >
          <SparklesIcon className="w-5 h-5" />
          CONTINUAR AL PAGO
        </motion.button>

        <p className="text-center text-xs text-gray-600 mt-4">
          Al continuar aceptas reservar el turno seleccionado.
        </p>
      </div>
    </motion.div>
  )
}
