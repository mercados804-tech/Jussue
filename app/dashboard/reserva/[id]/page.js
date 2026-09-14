'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  formatCurrency, formatDate, formatTime, formatDateLong, getStatusLabel, getStatusColorClass, cn,
} from '@/utils'
import { getReservationById, updateReservationStatus } from '@/services/reservations'
import { createNotification as createNotif } from '@/services/business'
import {
  ChevronLeft, UserIcon, PhoneIcon, MailIcon, CalendarIcon, ClockIcon,
  MoneyIcon, BankIcon, CheckIcon, XIcon, WhatsAppIcon, FileIcon, SparklesIcon,
} from '@/components/Icons'
import { sendTextMessage, buildConfirmationText } from '@/services/whatsapp'

const StatusBadge = ({ status }) => (
  <span className={cn(
    'inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border',
    getStatusColorClass(status),
  )}>
    {getStatusLabel(status)}
  </span>
)

export default function ReservationDetail() {
  const params = useParams()
  const router = useRouter()
  const [reservation, setReservation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState('')
  const [toast, setToast] = useState('')

  const id = params?.id

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        const r = await getReservationById(id)
        setReservation(r)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handleAction = async (action) => {
    if (!reservation) return
    setActionLoading(action)
    try {
      if (action === 'confirm') {
        await updateReservationStatus(reservation.id, 'confirmed')
        try {
          await createNotif({
            reservation_id: reservation.id,
            type: 'confirmation',
            status: 'pending',
          })
          await sendTextMessage(
            reservation.whatsapp,
            buildConfirmationText(
              reservation.service,
              formatDate(reservation.date),
              formatTime(reservation.time),
              formatCurrency(reservation.deposit_amount),
              formatCurrency(reservation.remaining_amount),
            )
          )
        } catch (e) { console.warn('WhatsApp no enviado:', e) }
        showToast('Seña confirmada · WhatsApp enviado')
        setReservation({ ...reservation, status: 'confirmed' })
      } else if (action === 'reject') {
        await updateReservationStatus(reservation.id, 'rejected')
        showToast('Comprobante rechazado')
        setReservation({ ...reservation, status: 'rejected' })
      } else if (action === 'cancel') {
        await updateReservationStatus(reservation.id, 'cancelled')
        showToast('Turno cancelado')
        setReservation({ ...reservation, status: 'cancelled' })
      }
    } catch (e) {
      console.error(e)
      showToast('Error · Intentá nuevamente')
    } finally {
      setActionLoading('')
    }
  }

  const handleContact = () => {
    if (!reservation) return
    const wa = reservation.whatsapp.replace(/\D/g, '')
    window.open(`https://wa.me/${wa}`, '_blank')
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-2 border-gold-500/30 border-t-gold-500 animate-spin" />
      </div>
    )
  }

  if (!reservation) {
    return (
      <div className="p-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 mb-6 hover:text-white">
          <ChevronLeft className="w-4 h-4" /> Volver
        </button>
        <div className="text-center py-16 text-gray-500">Reserva no encontrada</div>
      </div>
    )
  }

  const receipt = reservation.payment_receipts?.[0]
  const isPdf = receipt?.file_url?.toLowerCase().endsWith('.pdf')

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 z-50 glass-strong rounded-2xl px-5 py-3 border border-gold-500/30 shadow-glass"
        >
          <div className="flex items-center gap-2 text-sm text-white font-medium">
            <SparklesIcon className="w-4 h-4 text-gold-400" />
            {toast}
          </div>
        </motion.div>
      )}

      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-400 mb-6 hover:text-white transition-colors text-sm"
      >
        <ChevronLeft className="w-4 h-4" /> Volver al panel
      </button>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="font-serif text-2xl font-bold text-white">
              Reserva #{String(reservation.id).slice(0, 8).toUpperCase()}
            </h1>
            <StatusBadge status={reservation.status} />
          </div>
          <p className="text-gray-500 text-sm">
            Creada el {new Date(reservation.created_at).toLocaleString('es-AR')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="font-serif text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-gold-400" /> Datos de la clienta
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-dark-800/60 rounded-2xl p-4 border border-white/5">
                <div className="text-xs text-gray-500 mb-1">Nombre completo</div>
                <div className="text-white font-medium">
                  {reservation.customer_name} {reservation.customer_last_name}
                </div>
              </div>
              <div
                onClick={handleContact}
                className="bg-dark-800/60 rounded-2xl p-4 border border-white/5 cursor-pointer hover:border-gold-500/30 transition-colors group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">WhatsApp</div>
                    <div className="text-white font-medium">{reservation.whatsapp}</div>
                  </div>
                  <WhatsAppIcon className="w-4 h-4 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="bg-dark-800/60 rounded-2xl p-4 border border-white/5 md:col-span-2">
                <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <MailIcon className="w-3 h-3" /> Email
                </div>
                <div className="text-white font-medium break-all">{reservation.email}</div>
              </div>
              {reservation.notes && (
                <div className="bg-dark-800/60 rounded-2xl p-4 border border-white/5 md:col-span-2">
                  <div className="text-xs text-gray-500 mb-1">Observaciones</div>
                  <div className="text-white">{reservation.notes}</div>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h2 className="font-serif text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-gold-400" /> Turno
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-dark-800/60 rounded-2xl p-4 border border-white/5">
                <div className="text-xs text-gray-500 mb-1">Servicio</div>
                <div className="text-white font-medium">{reservation.service}</div>
              </div>
              <div className="bg-dark-800/60 rounded-2xl p-4 border border-white/5">
                <div className="text-xs text-gray-500 mb-1">Duración</div>
                <div className="text-white font-medium">~ {Math.floor((Number(reservation.remaining_amount) > 0 ? 180 : 180) / 60)} horas</div>
              </div>
              <div className="bg-dark-800/60 rounded-2xl p-4 border border-white/5">
                <div className="text-xs text-gray-500 mb-1">Fecha</div>
                <div className="text-white font-medium capitalize">{formatDateLong(reservation.date)}</div>
              </div>
              <div className="bg-dark-800/60 rounded-2xl p-4 border border-white/5">
                <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <ClockIcon className="w-3 h-3" /> Hora
                </div>
                <div className="text-white font-medium">{formatTime(reservation.time)} hs</div>
              </div>
            </div>
          </div>

          {receipt && (
            <div className="card">
              <h2 className="font-serif text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileIcon className="w-5 h-5 text-gold-400" /> Comprobante de pago
              </h2>
              <div className="bg-dark-800/60 rounded-2xl p-4 border border-white/5 mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {receipt.transfer_date && (
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">Fecha transferencia</div>
                      <div className="text-white">{formatDate(receipt.transfer_date)}</div>
                    </div>
                  )}
                  {receipt.transaction_number && (
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">Número comprobante</div>
                      <div className="text-white font-mono">{receipt.transaction_number}</div>
                    </div>
                  )}
                </div>
              </div>
              <div className="relative bg-dark-900 rounded-2xl overflow-hidden border border-white/5 aspect-[4/3] max-h-[480px]">
                {isPdf ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
                      <FileIcon className="w-10 h-10 text-red-400" />
                    </div>
                    <div className="text-white font-medium mb-2">Archivo PDF</div>
                    <a
                      href={receipt.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline text-sm py-2 px-4 rounded-xl"
                    >
                      Abrir PDF
                    </a>
                  </div>
                ) : (
                  <img
                    src={receipt.file_url}
                    alt="Comprobante"
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
              <div className="mt-3 text-xs text-gray-500 break-all">
                <a href={receipt.file_url} target="_blank" rel="noopener noreferrer" className="hover:text-gold-400 transition-colors">
                  Abrir en nueva pestaña →
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card sticky top-4">
            <h2 className="font-serif text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MoneyIcon className="w-5 h-5 text-gold-400" /> Pago
            </h2>
            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Precio total</span>
                <span className="text-white font-medium">{formatCurrency(reservation.total_price)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Seña</span>
                <span className="text-gold-400 font-medium">{formatCurrency(reservation.deposit_amount)}</span>
              </div>
              <div className="pt-3 border-t border-white/10 flex justify-between">
                <span className="text-gray-300 font-medium">Saldo restante</span>
                <span className="text-white font-bold">{formatCurrency(reservation.remaining_amount)}</span>
              </div>
            </div>

            <div className="space-y-3">
              {reservation.status === 'pending' && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleAction('confirm')}
                    disabled={!!actionLoading}
                    className="w-full btn-gold flex items-center justify-center gap-2"
                  >
                    {actionLoading === 'confirm' ? (
                      <div className="w-4 h-4 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" />
                    ) : (
                      <CheckIcon className="w-4 h-4" />
                    )}
                    CONFIRMAR SEÑA
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleAction('reject')}
                    disabled={!!actionLoading}
                    className="w-full btn-danger flex items-center justify-center gap-2"
                  >
                    {actionLoading === 'reject' ? (
                      <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                    ) : (
                      <XIcon className="w-4 h-4" />
                    )}
                    RECHAZAR COMPROBANTE
                  </motion.button>
                </>
              )}

              {reservation.status !== 'cancelled' && (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleAction('cancel')}
                  disabled={!!actionLoading}
                  className="w-full btn-ghost flex items-center justify-center gap-2 border border-white/10"
                >
                  {actionLoading === 'cancel' ? (
                    <div className="w-4 h-4 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin" />
                  ) : (
                    <XIcon className="w-4 h-4" />
                  )}
                  CANCELAR TURNO
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleContact}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl border border-green-500/30 text-green-400 font-semibold hover:bg-green-500/10 transition-all"
              >
                <WhatsAppIcon className="w-4 h-4" />
                CONTACTAR POR WHATSAPP
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
