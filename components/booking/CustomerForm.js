'use client'

import { motion } from 'framer-motion'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { customerSchema } from '@/schemas'
import { cn } from '@/utils'
import { ChevronLeft, UserIcon, PhoneIcon, MailIcon, SparklesIcon } from '../Icons'

export default function CustomerForm({ onSubmit, onBack, initialValues = {} }) {
  const defaults = {
    customer_name: '',
    customer_last_name: '',
    whatsapp: '',
    email: '',
    notes: '',
    ...initialValues,
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
          <h2 className="font-serif text-xl font-semibold text-white">Tus datos</h2>
          <div className="w-9" />
        </div>

        <Formik
          initialValues={defaults}
          validationSchema={customerSchema}
          validateOnBlur
          validateOnChange={false}
          onSubmit={(values, { setSubmitting }) => {
            onSubmit(values)
            setSubmitting(false)
          }}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label-text">
                    <span className="inline-flex items-center gap-1.5">
                      <UserIcon className="w-4 h-4 text-gold-400" /> Nombre
                    </span>
                  </label>
                  <Field
                    name="customer_name"
                    type="text"
                    placeholder="Tu nombre"
                    className={cn('input-field', errors.customer_name && touched.customer_name && 'input-error')}
                  />
                  <ErrorMessage name="customer_name" component="div" className="error-text" />
                </div>
                <div>
                  <label className="label-text">Apellido</label>
                  <Field
                    name="customer_last_name"
                    type="text"
                    placeholder="Tu apellido"
                    className={cn('input-field', errors.customer_last_name && touched.customer_last_name && 'input-error')}
                  />
                  <ErrorMessage name="customer_last_name" component="div" className="error-text" />
                </div>
              </div>

              <div>
                <label className="label-text">
                  <span className="inline-flex items-center gap-1.5">
                    <PhoneIcon className="w-4 h-4 text-gold-400" /> WhatsApp
                  </span>
                </label>
                <Field
                  name="whatsapp"
                  type="tel"
                  placeholder="+54 9 11 1234-5678"
                  className={cn('input-field', errors.whatsapp && touched.whatsapp && 'input-error')}
                />
                <ErrorMessage name="whatsapp" component="div" className="error-text" />
              </div>

              <div>
                <label className="label-text">
                  <span className="inline-flex items-center gap-1.5">
                    <MailIcon className="w-4 h-4 text-gold-400" /> Email
                  </span>
                </label>
                <Field
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  className={cn('input-field', errors.email && touched.email && 'input-error')}
                />
                <ErrorMessage name="email" component="div" className="error-text" />
              </div>

              <div>
                <label className="label-text">Observaciones <span className="text-gray-600">(opcional)</span></label>
                <Field
                  as="textarea"
                  name="notes"
                  rows={3}
                  placeholder="¿Algo que debamos saber? (opcional)"
                  className={cn('input-field resize-none', errors.notes && touched.notes && 'input-error')}
                />
                <ErrorMessage name="notes" component="div" className="error-text" />
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full btn-gold mt-2 flex items-center justify-center gap-2"
              >
                <SparklesIcon className="w-5 h-5" />
                CONTINUAR
              </motion.button>
            </Form>
          )}
        </Formik>
      </div>
    </motion.div>
  )
}
