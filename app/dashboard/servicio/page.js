'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { serviceSchema } from '@/schemas'
import { getBusinessSettings, updateBusinessSettings } from '@/services/business'
import { formatCurrency, cn } from '@/utils'
import { ScissorsIcon, SparklesIcon, MoneyIcon, ClockIcon, CheckIcon } from '@/components/Icons'

export default function ServicioPage() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  const load = async () => {
    try {
      const s = await getBusinessSettings()
      setSettings(s)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const showToast = (m) => {
    setToast(m)
    setTimeout(() => setToast(''), 3000)
  }

  const handleSubmit = async (values, { setSubmitting }) => {
    setSaving(true)
    try {
      await updateBusinessSettings(1, {
        service_name: values.service_name.trim(),
        service_price: Number(values.service_price),
        deposit_amount: Number(values.deposit_amount),
        duration: Number(values.duration),
      })
      showToast('Servicio actualizado')
      load()
    } catch (e) {
      console.error(e)
      showToast('Error al guardar')
    } finally {
      setSaving(false)
      setSubmitting(false)
    }
  }

  if (loading || !settings) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-2 border-gold-500/30 border-t-gold-500 animate-spin" />
      </div>
    )
  }

  const remaining = Number(settings.service_price) - Number(settings.deposit_amount)

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 right-4 z-50 glass-strong rounded-2xl px-5 py-3 border border-gold-500/30"
        >
          <div className="text-sm text-white font-medium">{toast}</div>
        </motion.div>
      )}

      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-white mb-1">Gestión del servicio</h1>
        <p className="text-gray-400 text-sm">Configurá nombre, precio, seña y duración</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <div className="card sticky top-4">
            <div className="flex items-center gap-3 mb-5 pb-5 border-b border-white/5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-500/20 to-champagne-500/20 border border-gold-500/30 flex items-center justify-center">
                <ScissorsIcon className="w-6 h-6 text-gold-400" />
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Vista previa</div>
                <div className="font-serif font-semibold text-white">{settings.service_name}</div>
              </div>
            </div>

            <p className="text-gray-400 text-sm mb-5">Cabello liso, brillante y saludable. Resultados profesionales.</p>

            <div className="space-y-3">
              <div className="bg-dark-800/60 rounded-2xl p-4 border border-white/5 flex items-center gap-3">
                <MoneyIcon className="w-5 h-5 text-gold-400" />
                <div>
                  <div className="text-xs text-gray-500">Precio total</div>
                  <div className="text-white font-bold">{formatCurrency(settings.service_price)}</div>
                </div>
              </div>
              <div className="bg-dark-800/60 rounded-2xl p-4 border border-white/5 flex items-center gap-3">
                <SparklesIcon className="w-5 h-5 text-gold-400" />
                <div>
                  <div className="text-xs text-gray-500">Seña</div>
                  <div className="text-gold-400 font-bold">{formatCurrency(settings.deposit_amount)}</div>
                </div>
              </div>
              <div className="bg-dark-800/60 rounded-2xl p-4 border border-white/5 flex items-center gap-3">
                <ClockIcon className="w-5 h-5 text-gold-400" />
                <div>
                  <div className="text-xs text-gray-500">Duración</div>
                  <div className="text-white font-bold">{Math.floor(Number(settings.duration) / 60)}h {Number(settings.duration) % 60 > 0 ? `${Number(settings.duration) % 60}m` : ''}</div>
                </div>
              </div>
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-sm">
                <span className="text-gray-400">Saldo restante</span>
                <span className="text-white font-bold">{formatCurrency(remaining)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="card">
            <h2 className="font-serif text-xl font-semibold text-white mb-5">Configuración</h2>

            <Formik
              initialValues={{
                service_name: settings.service_name || '',
                service_price: Number(settings.service_price) || 0,
                deposit_amount: Number(settings.deposit_amount) || 0,
                duration: Number(settings.duration) || 180,
              }}
              validationSchema={serviceSchema}
              validateOnBlur
              validateOnChange={false}
              enableReinitialize
              onSubmit={handleSubmit}
            >
              {({ errors, touched, isSubmitting, values }) => (
                <Form className="space-y-5">
                  <div>
                    <label className="label-text flex items-center gap-1.5">
                      <ScissorsIcon className="w-4 h-4 text-gold-400" /> Nombre del servicio
                    </label>
                    <Field
                      name="service_name"
                      type="text"
                      className={cn('input-field', errors.service_name && touched.service_name && 'input-error')}
                    />
                    <ErrorMessage name="service_name" component="div" className="error-text" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label-text flex items-center gap-1.5">
                        <MoneyIcon className="w-4 h-4 text-gold-400" /> Precio total ($)
                      </label>
                      <Field
                        name="service_price"
                        type="number"
                        min="0"
                        step="100"
                        className={cn('input-field', errors.service_price && touched.service_price && 'input-error')}
                      />
                      <ErrorMessage name="service_price" component="div" className="error-text" />
                    </div>
                    <div>
                      <label className="label-text flex items-center gap-1.5">
                        <SparklesIcon className="w-4 h-4 text-gold-400" /> Seña ($)
                      </label>
                      <Field
                        name="deposit_amount"
                        type="number"
                        min="0"
                        step="100"
                        className={cn('input-field', errors.deposit_amount && touched.deposit_amount && 'input-error')}
                      />
                      <ErrorMessage name="deposit_amount" component="div" className="error-text" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label-text flex items-center gap-1.5">
                        <ClockIcon className="w-4 h-4 text-gold-400" /> Duración (minutos)
                      </label>
                      <Field
                        name="duration"
                        type="number"
                        min="30"
                        step="15"
                        className={cn('input-field', errors.duration && touched.duration && 'input-error')}
                      />
                      <ErrorMessage name="duration" component="div" className="error-text" />
                      <div className="text-xs text-gray-600 mt-1.5">
                        Ej: 180 = 3 horas. Se usa para calcular turnos disponibles.
                      </div>
                    </div>
                    <div>
                      <label className="label-text">Saldo restante (calculado)</label>
                      <div className="input-field bg-dark-900/60 text-gray-300">
                        {formatCurrency(Math.max(0, Number(values.service_price) - Number(values.deposit_amount)))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={load}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      Restablecer
                    </button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={saving || isSubmitting}
                      className="btn-gold flex items-center gap-2 disabled:opacity-60"
                    >
                      {saving ? (
                        <div className="w-4 h-4 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" />
                      ) : (
                        <CheckIcon className="w-4 h-4" />
                      )}
                      Guardar cambios
                    </motion.button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  )
}
