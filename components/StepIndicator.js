'use client'

import { motion } from 'framer-motion'
import { CheckIcon } from './Icons'

const steps = [
  { id: 1, label: 'Servicio' },
  { id: 2, label: 'Fecha' },
  { id: 3, label: 'Horario' },
  { id: 4, label: 'Tus datos' },
  { id: 5, label: 'Resumen' },
  { id: 6, label: 'Pago' },
  { id: 7, label: 'Listo' },
]

export default function StepIndicator({ currentStep }) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8 px-2">
      <div className="flex items-center justify-between">
        {steps.map((step, idx) => {
          const isDone = currentStep > step.id
          const isActive = currentStep === step.id
          const isLast = idx === steps.length - 1

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor: isDone || isActive ? 'rgba(232,182,76,0.15)' : 'rgba(255,255,255,0.05)',
                    borderColor: isDone || isActive ? 'rgba(232,182,76,0.5)' : 'rgba(255,255,255,0.1)',
                    color: isDone || isActive ? '#E8B64C' : '#666',
                  }}
                  transition={{ duration: 0.3 }}
                  className={`w-9 h-9 md:w-10 md:h-10 rounded-full border-2 flex items-center justify-center font-semibold text-sm`}
                >
                  {isDone ? (
                    <CheckIcon className="w-4 h-4 md:w-5 md:h-5" />
                  ) : (
                    step.id
                  )}
                </motion.div>
                <span className={`hidden md:block text-xs font-medium transition-colors ${
                  isDone || isActive ? 'text-gold-400' : 'text-gray-600'
                }`}>
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div className="flex-1 mx-1 md:mx-2 h-0.5 relative overflow-hidden bg-white/10 rounded-full">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-gold-500 to-champagne-500"
                    initial={{ width: 0 }}
                    animate={{ width: isDone ? '100%' : '0%' }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
