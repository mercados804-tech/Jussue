'use client'

import { motion } from 'framer-motion'
import { formatCurrency, cn } from '@/utils'
import { SparklesIcon, ClockIcon, MoneyIcon, ScissorsIcon } from '../Icons'

export default function BookingHero({ settings, onStart }) {
  if (!settings) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-xl mx-auto"
    >
      <div className="card relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-champagne-500/5 rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex flex-col items-center text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring' }}
              className="w-20 h-20 rounded-3xl bg-gradient-to-br from-gold-500/20 to-champagne-500/20 border border-gold-500/30 flex items-center justify-center mb-4 shadow-gold-glow"
            >
              <ScissorsIcon className="w-10 h-10 text-gold-400" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="font-serif text-3xl md:text-4xl font-semibold mb-2"
            >
              <span className="gold-gradient-text">{settings.business_name}</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 max-w-sm"
            >
              {settings.description}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-strong rounded-3xl p-6 mb-6"
          >
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                <SparklesIcon className="w-6 h-6 text-gold-400" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-semibold text-white mb-1">
                  {settings.service_name}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Cabello liso, brillante y saludable. Tratamiento profesional con productos de alta calidad.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-dark-800/60 rounded-2xl p-3 text-center border border-white/5">
                <MoneyIcon className="w-5 h-5 text-gold-400 mx-auto mb-1.5" />
                <div className="text-xs text-gray-500 mb-0.5">Precio</div>
                <div className="text-gold-400 font-bold text-lg">
                  {formatCurrency(settings.service_price)}
                </div>
              </div>
              <div className="bg-dark-800/60 rounded-2xl p-3 text-center border border-white/5">
                <SparklesIcon className="w-5 h-5 text-gold-400 mx-auto mb-1.5" />
                <div className="text-xs text-gray-500 mb-0.5">Seña</div>
                <div className="text-gold-400 font-bold text-lg">
                  {formatCurrency(settings.deposit_amount)}
                </div>
              </div>
              <div className="bg-dark-800/60 rounded-2xl p-3 text-center border border-white/5">
                <ClockIcon className="w-5 h-5 text-gold-400 mx-auto mb-1.5" />
                <div className="text-xs text-gray-500 mb-0.5">Duración</div>
                <div className="text-white font-bold text-lg">
                  {Math.floor(settings.duration / 60)}h
                </div>
              </div>
            </div>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStart}
            className="w-full btn-gold text-lg py-4 rounded-2xl flex items-center justify-center gap-2"
          >
            <SparklesIcon className="w-5 h-5" />
            RESERVAR MI TURNO
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
