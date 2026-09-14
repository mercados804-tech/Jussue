'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { businessSchema } from '@/schemas'
import { getBusinessSettings, updateBusinessSettings } from '@/services/business'
import { cn } from '@/utils'
import {
  SparklesIcon, PhoneIcon, MailIcon, BankIcon, UserIcon, CheckIcon, SettingsIcon,
} from '@/components/Icons'

export default function ConfiguracionPage() {
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
        business_name: values.business_name.trim(),
        whatsapp: values.whatsapp?.trim() || null,
        description: values.description?.trim() || null,
        address: values.address?.trim() || null,
        bank_name: values.bank_name?.trim() || null,
        account_holder: values.account_holder?.trim() || null,
        cbu: values.cbu?.trim() || null,
        alias: values.alias?.trim() || null,
      })
      showToast('Configuración guardada')
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

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
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
        <h1 className="font-serif text-3xl font-bold text-white mb-1 flex items-center gap-2">
          <SettingsIcon className="w-7 h-7 text-gold-400" /> Ajustes
        </h1>
        <p className="text-gray-400 text-sm">Información del negocio y datos bancarios</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-serif text-xl font-semibold text-white mb-5 flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-gold-400" /> Negocio
          </h2>

          <Formik
            initialValues={{
              business_name: settings.business_name || '',
              whatsapp: settings.whatsapp || '',
              description: settings.description || '',
              address: settings.address || '',
            }}
            validationSchema={businessSchema}
            validateOnBlur
            validateOnChange={false}
            enableReinitialize
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="space-y-4">
                <div>
                  <label className="label-text">Nombre de la peluquería</label>
                  <Field
                    name="business_name"
                    type="text"
                    className={cn('input-field', errors.business_name && touched.business_name && 'input-error')}
                  />
                  <ErrorMessage name="business_name" component="div" className="error-text" />
                </div>

                <div>
                  <label className="label-text flex items-center gap-1.5">
                    <PhoneIcon className="w-4 h-4 text-gold-400" /> WhatsApp del negocio
                  </label>
                  <Field
                    name="whatsapp"
                    type="tel"
                    placeholder="+54 9 11 1234-5678"
                    className={cn('input-field', errors.whatsapp && touched.whatsapp && 'input-error')}
                  />
                  <ErrorMessage name="whatsapp" component="div" className="error-text" />
                  <div className="text-xs text-gray-600 mt-1.5">
                    Se usa para el link "Contactar por WhatsApp" del dashboard.
                  </div>
                </div>

                <div>
                  <label className="label-text">Dirección</label>
                  <Field
                    name="address"
                    type="text"
                    placeholder="Calle 123, Ciudad"
                    className={cn('input-field', errors.address && touched.address && 'input-error')}
                  />
                  <ErrorMessage name="address" component="div" className="error-text" />
                </div>

                <div>
                  <label className="label-text">Descripción corta</label>
                  <Field
                    as="textarea"
                    name="description"
                    rows={3}
                    className={cn('input-field resize-none', errors.description && touched.description && 'input-error')}
                  />
                  <ErrorMessage name="description" component="div" className="error-text" />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={saving || isSubmitting}
                  className="w-full btn-gold flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" />
                  ) : (
                    <CheckIcon className="w-4 h-4" />
                  )}
                  Guardar negocio
                </motion.button>
              </Form>
            )}
          </Formik>
        </div>

        <div className="card">
          <h2 className="font-serif text-xl font-semibold text-white mb-5 flex items-center gap-2">
            <BankIcon className="w-5 h-5 text-gold-400" /> Datos bancarios
          </h2>

          <Formik
            initialValues={{
              bank_name: settings.bank_name || '',
              account_holder: settings.account_holder || '',
              cbu: settings.cbu || '',
              alias: settings.alias || '',
            }}
            validationSchema={businessSchema}
            validateOnBlur
            validateOnChange={false}
            enableReinitialize
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="space-y-4">
                <div>
                  <label className="label-text">Banco</label>
                  <Field
                    name="bank_name"
                    type="text"
                    placeholder="Banco Provincia"
                    className={cn('input-field', errors.bank_name && touched.bank_name && 'input-error')}
                  />
                  <ErrorMessage name="bank_name" component="div" className="error-text" />
                </div>

                <div>
                  <label className="label-text flex items-center gap-1.5">
                    <UserIcon className="w-4 h-4 text-gold-400" /> Titular de la cuenta
                  </label>
                  <Field
                    name="account_holder"
                    type="text"
                    placeholder="Nombre Apellido"
                    className={cn('input-field', errors.account_holder && touched.account_holder && 'input-error')}
                  />
                  <ErrorMessage name="account_holder" component="div" className="error-text" />
                </div>

                <div>
                  <label className="label-text">CBU (22 dígitos)</label>
                  <Field
                    name="cbu"
                    type="text"
                    placeholder="0000000000000000000000"
                    className={cn('input-field font-mono text-sm', errors.cbu && touched.cbu && 'input-error')}
                  />
                  <ErrorMessage name="cbu" component="div" className="error-text" />
                </div>

                <div>
                  <label className="label-text">Alias</label>
                  <Field
                    name="alias"
                    type="text"
                    placeholder="peluqueria.alisado"
                    className={cn('input-field', errors.alias && touched.alias && 'input-error')}
                  />
                  <ErrorMessage name="alias" component="div" className="error-text" />
                </div>

                <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-4">
                  <p className="text-xs text-yellow-400/80 leading-relaxed">
                    Estos datos se muestran a las clientas en el paso de pago para que realicen la transferencia.
                    Asegurate de que sean correctos.
                  </p>
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={saving || isSubmitting}
                  className="w-full btn-gold flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" />
                  ) : (
                    <CheckIcon className="w-4 h-4" />
                  )}
                  Guardar datos bancarios
                </motion.button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  )
}
