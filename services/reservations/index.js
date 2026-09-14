import { supabase } from '@/lib/supabase/client'

export const createReservation = async (reservationData) => {
  const { data, error } = await supabase
    .from('reservations')
    .insert(reservationData)
    .select()
    .single()
  if (error) throw error
  return data
}

export const findReservation = async ({ date, time, email, whatsapp }) => {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('date', date)
    .eq('time', time)
    .eq('email', email)
    .eq('whatsapp', whatsapp)
    .maybeSingle()
  if (error) throw error
  return data
}

export const getReservations = async (filters = {}) => {
  let query = supabase
    .from('reservations')
    .select(`
      *,
      payment_receipts(*)
    `)
    .order('date', { ascending: true })
    .order('time', { ascending: true })

  if (filters.status) query = query.eq('status', filters.status)
  if (filters.fromDate) query = query.gte('date', filters.fromDate)
  if (filters.toDate) query = query.lte('date', filters.toDate)
  if (filters.date) query = query.eq('date', filters.date)

  const { data, error } = await query
  if (error) throw error
  return data
}

export const getReservationById = async (id) => {
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      payment_receipts(*)
    `)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export const getReservedSlots = async (date) => {
  const { data, error } = await supabase
    .from('reservations')
    .select('time')
    .eq('date', date)
    .in('status', ['pending', 'confirmed', 'completed'])

  if (error) throw error
  return data.map((r) => r.time)
}

export const updateReservationStatus = async (id, status) => {
  const { data, error } = await supabase
    .from('reservations')
    .update({ status })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export const createPaymentReceipt = async (receiptData) => {
  const { data, error } = await supabase
    .from('payment_receipts')
    .insert(receiptData)
    .select()
    .single()
  if (error) throw error
  return data
}

export const uploadReceipt = async (file, reservationId) => {
  const ext = file.name.split('.').pop()?.toLowerCase()
  const fileName = `${Date.now()}-${reservationId}.${ext}`
  const filePath = `receipts/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('receipts')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    })
  if (uploadError) throw uploadError

  const { data: urlData } = supabase.storage
    .from('receipts')
    .getPublicUrl(filePath)

  return urlData.publicUrl
}
