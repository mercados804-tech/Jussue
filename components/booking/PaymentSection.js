'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { formatCurrency } from '@/utils'
import { ChevronLeft, BankIcon, MoneyIcon, CheckIcon, SparklesIcon, FileIcon } from '../Icons'
import { createReservation, findReservation } from '@/services/reservations'

export default function PaymentSection({
  settings, date, time, customer, onPaymentDone, onBack, setReservationId,
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const deposit = Number(settings.deposit_amount)

  const handleContinue = async () => {
    setLoading(true)
    setError('')
    try {
      const total = Number(settings.service_price)
      const reservation = await createReservation({
        customer_name: customer.customer_name.trim(),
        customer_last_name: customer.customer_last_name.trim(),
        whatsapp: customer.whatsapp.trim(),
        email: customer.email.trim(),
        notes: customer.notes?.trim() || null,
        service: settings.service_name,
        date,
        time,
        total_price: total,
        deposit_amount: deposit,
        remaining_amount: total - deposit,
        status: 'pending',
      })
      setReservationId(reservation.id)
      onPaymentDone()
    } catch (err) {
      console.error(err)
      try {
        const existingReservation = await findReservation({
          date,
          time,
          email: customer.email.trim(),
          whatsapp: customer.whatsapp.trim(),
        })
        if (existingReservation) {
          setReservationId(existingReservation.id)
          onPaymentDone()
          return
        }
      } catch (lookupError) {
        console.error(lookupError)
      }
      if (err.message?.includes('duplicate')) {
        setError('Este horario ya fue reservado. Por favor, elegí otro.')
      } else {
        setError('Ocurrió un error. Intentá nuevamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  const copyText = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text)
      alert(`${label} copiado`)
    } catch {}
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
          <h2 className="font-serif text-xl font-semibold text-white">Pago de la seña</h2>
          <div className="w-9" />
        </div>

        <div className="bg-gradient-to-br from-gold-500/10 via-champagne-500/5 to-gold-500/5 rounded-3xl p-5 mb-5 border border-gold-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gold-500/15 flex items-center justify-center">
                <MoneyIcon className="w-6 h-6 text-gold-400" />
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-0.5">Monto a transferir</div>
                <div className="text-2xl font-bold gold-gradient-text">{formatCurrency(deposit)}</div>
              </div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-dark-900/60 flex items-center justify-center border border-white/5">
              <BankIcon className="w-7 h-7 text-gold-400/80" />
            </div>
          </div>
        </div>

        <div className="glass-strong rounded-2xl p-5 mb-6 space-y-4">
          <h3 className="font-medium text-white mb-2 flex items-center gap-2">
            <BankIcon className="w-4 h-4 text-gold-400" />
            Datos para la transferencia
          </h3>

          <div
            onClick={() => copyText(settings.bank_name, 'Banco')}
            className="bg-dark-800/60 rounded-2xl p-3 border border-white/5 cursor-pointer hover:border-gold-500/30 transition-colors group"
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Banco</div>
                <div className="text-white font-medium">{settings.bank_name || '-'}</div>
              </div>
              <div className="text-xs text-gold-400/70 opacity-0 group-hover:opacity-100 transition-opacity">Copiar</div>
            </div>
          </div>

          <div
            onClick={() => copyText(settings.account_holder, 'Titular')}
            className="bg-dark-800/60 rounded-2xl p-3 border border-white/5 cursor-pointer hover:border-gold-500/30 transition-colors group"
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Titular</div>
                <div className="text-white font-medium">{settings.account_holder || '-'}</div>
              </div>
              <div className="text-xs text-gold-400/70 opacity-0 group-hover:opacity-100 transition-opacity">Copiar</div>
            </div>
          </div>

          <div
            onClick={() => copyText(settings.cbu, 'CBU')}
            className="bg-dark-800/60 rounded-2xl p-3 border border-white/5 cursor-pointer hover:border-gold-500/30 transition-colors group"
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xs text-gray-500 mb-0.5">CBU</div>
                <div className="text-white font-medium font-mono text-sm">{settings.cbu || '-'}</div>
              </div>
              <div className="text-xs text-gold-400/70 opacity-0 group-hover:opacity-100 transition-opacity">Copiar</div>
            </div>
          </div>

          <div
            onClick={() => copyText(settings.alias, 'Alias')}
            className="bg-dark-800/60 rounded-2xl p-3 border border-white/5 cursor-pointer hover:border-gold-500/30 transition-colors group"
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Alias</div>
                <div className="text-white font-medium">{settings.alias || '-'}</div>
              </div>
              <div className="text-xs text-gold-400/70 opacity-0 group-hover:opacity-100 transition-opacity">Copiar</div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Monto</span>
              <span className="text-gold-400 font-bold text-lg">{formatCurrency(deposit)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 mb-5 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-4">
          <div className="w-5 h-5 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-yellow-400 text-xs font-bold">!</span>
          </div>
          <p className="text-sm text-yellow-400/80 leading-relaxed">
            Realizá la transferencia por el monto indicado. En el siguiente paso podrás subir el comprobante.
            La reserva se confirmará una vez verificada la seña.
          </p>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl p-3">
            {error}
          </div>
        )}

        <motion.button
          onClick={handleContinue}
          disabled={loading}
          whileHover={!loading ? { scale: 1.01 } : {}}
          whileTap={!loading ? { scale: 0.99 } : {}}
          className="w-full btn-gold flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <CheckIcon className="w-5 h-5" />
              YA REALICÉ LA TRANSFERENCIA
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}
