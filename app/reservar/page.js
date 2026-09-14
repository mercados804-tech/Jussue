'use client'

import { useBookingFlow } from '@/hooks/useBookingFlow'
import { AnimatePresence } from 'framer-motion'
import StepIndicator from '@/components/StepIndicator'
import BookingHero from '@/components/booking/BookingHero'
import DatePicker from '@/components/booking/DatePicker'
import TimeSlots from '@/components/booking/TimeSlots'
import CustomerForm from '@/components/booking/CustomerForm'
import BookingSummary from '@/components/booking/BookingSummary'
import PaymentSection from '@/components/booking/PaymentSection'
import ReceiptUploader from '@/components/booking/ReceiptUploader'
import BookingSuccess from '@/components/booking/BookingSuccess'

export default function ReservarPage() {
  const flow = useBookingFlow()

  const renderStep = () => {
    switch (flow.step) {
      case 1:
        return (
          <BookingHero
            settings={flow.settings}
            onStart={() => flow.setStep(2)}
          />
        )
      case 2:
        return (
          <DatePicker
            schedules={flow.schedules}
            blockedDates={flow.blockedDates}
            selectedDate={flow.selectedDate}
            onSelectDate={flow.selectDate}
            onBack={() => flow.setStep(1)}
          />
        )
      case 3:
        return (
          <TimeSlots
            date={flow.selectedDate}
            availableSlots={flow.availableSlots}
            selectedTime={flow.selectedTime}
            onSelectTime={flow.selectTime}
            onBack={() => flow.setStep(2)}
          />
        )
      case 4:
        return (
          <CustomerForm
            initialValues={flow.customerData || {}}
            onSubmit={flow.submitCustomer}
            onBack={() => flow.setStep(3)}
          />
        )
      case 5:
        return (
          <BookingSummary
            settings={flow.settings}
            date={flow.selectedDate}
            time={flow.selectedTime}
            customer={flow.customerData}
            onConfirm={() => flow.setStep(6)}
            onBack={() => flow.setStep(4)}
          />
        )
      case 6:
        return !flow.reservationId ? (
          <PaymentSection
            settings={flow.settings}
            date={flow.selectedDate}
            time={flow.selectedTime}
            customer={flow.customerData}
            onPaymentDone={() => {}}
            onBack={() => flow.setStep(5)}
            setReservationId={flow.goToReceipt}
          />
        ) : !flow.receiptUploaded ? (
          <ReceiptUploader
            reservationId={flow.reservationId}
            onFinish={flow.finish}
            settings={flow.settings}
            customer={flow.customerData}
          />
        ) : null
      case 7:
        return (
          <BookingSuccess
            settings={flow.settings}
            date={flow.selectedDate}
            time={flow.selectedTime}
            customer={flow.customerData}
            onReset={flow.reset}
          />
        )
      default:
        return null
    }
  }

  if (flow.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full border-2 border-gold-500/30 border-t-gold-500 animate-spin" />
          <div className="text-gray-400 text-sm">Cargando...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-champagne-500/5 rounded-full blur-3xl" />
      </div>

      <main className="relative z-10 px-4 py-8 pb-20">
        {flow.step > 1 && flow.step < 7 && (
          <StepIndicator currentStep={flow.step} />
        )}
        <AnimatePresence mode="wait">
          <div key={flow.step}>{renderStep()}</div>
        </AnimatePresence>
      </main>

      <footer className="relative z-10 border-t border-white/5 py-6 px-4">
        <div className="max-w-4xl mx-auto text-center text-xs text-gray-600">
          © {new Date().getFullYear()} {flow.settings?.business_name || 'Jusse Cristal'}. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  )
}
