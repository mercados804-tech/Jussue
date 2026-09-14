'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { loginSchema } from '@/schemas'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { SparklesIcon, EyeIcon, EyeOffIcon, MailIcon } from '@/components/Icons'
import { cn } from '@/utils'

export default function LoginPage() {
  const { signIn } = useAuth()
  const router = useRouter()
  const [showPass, setShowPass] = useState(false)
  const [globalError, setGlobalError] = useState('')

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-champagne-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="card">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gold-500/20 to-champagne-500/20 border border-gold-500/30 flex items-center justify-center shadow-gold-glow">
              <SparklesIcon className="w-8 h-8 text-gold-400" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-white mb-1">Panel Administrativo</h1>
            <p className="text-gray-400 text-sm">Ingresá para gestionar tus reservas</p>
          </div>

          <Formik
            initialValues={{ email: 'admin@peluqueria.com', password: '123456' }}
            validationSchema={loginSchema}
            validateOnBlur
            validateOnChange={false}
            onSubmit={async (values, { setSubmitting }) => {
              setGlobalError('')
              try {
                await signIn(values.email, values.password)
                router.push('/dashboard')
              } catch (err) {
                console.error(err)
                setGlobalError('Email o contraseña incorrectos')
              } finally {
                setSubmitting(false)
              }
            }}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="space-y-4">
                <div>
                  <label className="label-text flex items-center gap-1.5">
                    <MailIcon className="w-4 h-4 text-gold-400" /> Email
                  </label>
                  <Field
                    name="email"
                    type="email"
                    placeholder="admin@peluqueria.com"
                    className={cn('input-field', errors.email && touched.email && 'input-error')}
                  />
                  <ErrorMessage name="email" component="div" className="error-text" />
                </div>

                <div>
                  <label className="label-text">Contraseña</label>
                  <div className="relative">
                    <Field
                      name="password"
                      type={showPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={cn('input-field pr-12', errors.password && touched.password && 'input-error')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gold-400 transition-colors"
                    >
                      {showPass ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                  </div>
                  <ErrorMessage name="password" component="div" className="error-text" />
                </div>

                {globalError && (
                  <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl p-3">
                    {globalError}
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={!isSubmitting ? { scale: 1.01 } : {}}
                  whileTap={!isSubmitting ? { scale: 0.99 } : {}}
                  className="w-full btn-gold flex items-center justify-center gap-2 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" />
                      Ingresando...
                    </>
                  ) : (
                    'INGRESAR'
                  )}
                </motion.button>
              </Form>
            )}
          </Formik>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          Panel privado · Solo personal autorizado
        </p>
      </motion.div>
    </div>
  )
}
