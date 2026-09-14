'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { UploadIcon, CheckIcon, FileIcon, XIcon, SparklesIcon } from '../Icons'
import { validateFile, cn } from '@/utils'
import { uploadReceipt, createPaymentReceipt } from '@/services/reservations'
import { createNotification as createNotif } from '@/services/business'

export default function ReceiptUploader({ reservationId, onFinish, settings, customer }) {
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [transferDate, setTransferDate] = useState('')
  const [transactionNumber, setTransactionNumber] = useState('')

  const handleFile = (f) => {
    setError('')
    const check = validateFile(f)
    if (!check.valid) {
      setError(check.error)
      return
    }
    setFile(f)
    if (f.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target.result)
      reader.readAsDataURL(f)
    } else {
      setPreview(null)
    }
  }

  const onFileChange = (e) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }

  const clearFile = () => {
    setFile(null)
    setPreview(null)
    setError('')
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Por favor, seleccioná un archivo')
      return
    }
    setUploading(true)
    setError('')
    try {
      const url = await uploadReceipt(file, reservationId)
      await createPaymentReceipt({
        reservation_id: reservationId,
        file_url: url,
        transfer_date: transferDate || null,
        transaction_number: transactionNumber?.trim() || null,
        status: 'pending',
      })
      try {
        await createNotif({
          reservation_id: reservationId,
          type: 'admin_new',
          status: 'pending',
        })
      } catch (notificationError) {
        console.error(notificationError)
      }
      onFinish()
    } catch (err) {
      console.error(err)
      setError('Error al subir el comprobante. Intentá nuevamente.')
    } finally {
      setUploading(false)
    }
  }

  const isPdf = file?.type === 'application/pdf'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-xl mx-auto"
    >
      <div className="card">
        <div className="text-center mb-6">
          <h2 className="font-serif text-2xl font-semibold text-white mb-2">Subí tu comprobante</h2>
          <p className="text-gray-400 text-sm">JPG, PNG, WEBP o PDF · Máx. 10MB</p>
        </div>

        <div className="mb-4 space-y-3">
          <div>
            <label className="label-text">Fecha de transferencia <span className="text-gray-600">(opcional)</span></label>
            <input
              type="date"
              value={transferDate}
              onChange={(e) => setTransferDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label-text">Número de comprobante <span className="text-gray-600">(opcional)</span></label>
            <input
              type="text"
              value={transactionNumber}
              onChange={(e) => setTransactionNumber(e.target.value)}
              placeholder="Ej: 00012345"
              className="input-field"
            />
          </div>
        </div>

        {!file ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              'relative border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all duration-300',
              dragOver ? 'border-gold-500 bg-gold-500/10 scale-[1.01]' : 'border-white/15 bg-white/[0.02] hover:border-gold-500/30 hover:bg-white/[0.04]',
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
              onChange={onFileChange}
              className="hidden"
            />
            <motion.div
              animate={dragOver ? { y: -4, scale: 1.05 } : { y: 0, scale: 1 }}
              className="w-16 h-16 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mx-auto mb-4"
            >
              <UploadIcon className="w-8 h-8 text-gold-400" />
            </motion.div>
            <div className="text-white font-medium mb-1">Hacé clic o arrastrá el archivo</div>
            <div className="text-gray-500 text-sm">Comprobante de la transferencia</div>
          </div>
        ) : (
          <div className="relative bg-dark-800/60 border border-white/10 rounded-3xl overflow-hidden">
            <button
              onClick={clearFile}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-dark-900/80 backdrop-blur border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-red-500/20 hover:border-red-500/30 transition-all"
            >
              <XIcon className="w-4 h-4" />
            </button>
            <div className="aspect-[4/3] bg-dark-900 flex items-center justify-center">
              {preview ? (
                <img src={preview} alt="preview" className="max-w-full max-h-full object-contain" />
              ) : (
                <div className="text-center p-6">
                  <FileIcon className="w-16 h-16 text-red-400/70 mx-auto mb-3" />
                  <div className="text-white font-medium">{file.name}</div>
                  <div className="text-gray-500 text-xs mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
              )}
            </div>
            <div className="p-3 border-t border-white/5 flex items-center gap-2 text-sm">
              <CheckIcon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="text-gray-300 truncate">{file.name}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl p-3">
            {error}
          </div>
        )}

        <motion.button
          onClick={handleUpload}
          disabled={!file || uploading}
          whileHover={file && !uploading ? { scale: 1.01 } : {}}
          whileTap={file && !uploading ? { scale: 0.99 } : {}}
          className="w-full btn-gold mt-6 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {uploading ? (
            <>
              <div className="w-5 h-5 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" />
              Subiendo...
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5" />
              ENVIAR RESERVA
            </>
          )}
        </motion.button>

        <p className="text-center text-xs text-gray-600 mt-4">
          Tu reserva quedará pendiente de verificación. Te avisaremos por WhatsApp cuando se confirme.
        </p>
      </div>
    </motion.div>
  )
}
