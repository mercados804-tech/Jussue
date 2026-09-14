'use client'

import { useEffect, useState } from 'react'
import { getBusinessSettings, getSchedules, getBlockedDates } from '@/services/business'
import { getReservedSlots } from '@/services/reservations'
import { generateTimeSlots, toISODate, addDays, getTodayISO } from '@/utils'

export const useBookingFlow = () => {
  const [step, setStep] = useState(1)
  const [settings, setSettings] = useState(null)
  const [schedules, setSchedules] = useState([])
  const [blockedDates, setBlockedDates] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [availableSlots, setAvailableSlots] = useState([])
  const [customerData, setCustomerData] = useState(null)
  const [reservationId, setReservationId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [receiptUploaded, setReceiptUploaded] = useState(false)

  useEffect(() => {
    const loadInitial = async () => {
      try {
        const [s, sch, bd] = await Promise.all([
          getBusinessSettings(),
          getSchedules(),
          getBlockedDates(getTodayISO(), toISODate(addDays(new Date(), 60))),
        ])
        setSettings(s)
        setSchedules(sch)
        setBlockedDates(bd)
      } catch (e) {
        console.error(e)
        setSettings({
          id: 1,
          business_name: 'Peluquería Alisados Premium',
          description: 'Cabello liso, brillante y saludable.',
          service_name: 'Alisado Profesional',
          service_price: 50000,
          deposit_amount: 10000,
          duration: 180,
          bank_name: 'Banco Provincia',
          account_holder: 'Nombre Apellido',
          cbu: '0000000000000000000000',
          alias: 'peluqueria.alisado',
          whatsapp: '',
        })
        setSchedules([
          { day_of_week: 1, start_time: '09:00', end_time: '19:00', active: true },
          { day_of_week: 2, start_time: '09:00', end_time: '19:00', active: true },
          { day_of_week: 3, start_time: '09:00', end_time: '19:00', active: true },
          { day_of_week: 4, start_time: '09:00', end_time: '19:00', active: true },
          { day_of_week: 5, start_time: '09:00', end_time: '19:00', active: true },
          { day_of_week: 6, start_time: '09:00', end_time: '14:00', active: true },
        ])
      } finally {
        setLoading(false)
      }
    }
    loadInitial()
  }, [])

  const loadAvailableSlots = async (date) => {
    if (!date || !schedules.length || !settings) {
      setAvailableSlots([])
      return
    }
    const dow = new Date(date).getDay()
    const daySchedule = schedules.find((s) => s.day_of_week === dow && s.active)
    const isBlocked = blockedDates.some((b) => b.date === date)

    if (!daySchedule || isBlocked) {
      setAvailableSlots([])
      return
    }

    try {
      const reserved = await getReservedSlots(date)
      const allSlots = generateTimeSlots(
        daySchedule.start_time,
        daySchedule.end_time,
        settings.duration,
        30
      )
      setAvailableSlots(
        allSlots.map((slot) => ({
          time: slot,
          available: !reserved.includes(slot),
        }))
      )
    } catch (e) {
      console.error(e)
      setAvailableSlots([])
    }
  }

  const selectDate = (date) => {
    setSelectedDate(date)
    setSelectedTime(null)
    loadAvailableSlots(date)
    setStep(3)
  }

  const selectTime = (time) => {
    setSelectedTime(time)
    setStep(4)
  }

  const submitCustomer = (data) => {
    setCustomerData(data)
    setStep(5)
  }

  const goToPayment = () => setStep(6)

  const goToReceipt = (resId) => {
    setReservationId(resId)
  }

  const finish = () => {
    setReceiptUploaded(true)
    setStep(7)
  }

  const reset = () => {
    setStep(1)
    setSelectedDate(null)
    setSelectedTime(null)
    setCustomerData(null)
    setReservationId(null)
    setReceiptUploaded(false)
  }

  return {
    step,
    settings,
    schedules,
    blockedDates,
    selectedDate,
    selectedTime,
    availableSlots,
    customerData,
    reservationId,
    loading,
    receiptUploaded,
    setReceiptUploaded,
    selectDate,
    selectTime,
    submitCustomer,
    goToPayment,
    goToReceipt,
    finish,
    reset,
    setStep,
  }
}
