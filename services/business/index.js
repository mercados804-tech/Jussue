import { supabase } from '@/lib/supabase/client'

export const getBusinessSettings = async () => {
  const { data, error } = await supabase
    .from('business_settings')
    .select('*')
    .limit(1)
    .maybeSingle()
  if (error) throw error
  if (!data) return getDefaultSettings()

  return {
    ...data,
    business_name: data.business_name === 'Peluquería Alisados Premium'
      ? 'Jusse Cristal'
      : data.business_name,
  }
}

export const updateBusinessSettings = async (id, settings) => {
  const { data, error } = await supabase
    .from('business_settings')
    .upsert({ id, ...settings })
    .select()
    .single()
  if (error) throw error
  return data
}

export const getDefaultSettings = () => ({
  id: 1,
  business_name: 'Jusse Cristal',
  logo: null,
  description: 'Cabello liso, brillante y saludable.',
  address: '',
  whatsapp: '',
  service_name: 'Alisado Profesional',
  service_price: 50000,
  deposit_amount: 10000,
  duration: 180,
  bank_name: 'Banco Provincia',
  account_holder: 'Nombre Apellido',
  cbu: '0000000000000000000000',
  alias: 'peluqueria.alisado',
})

export const getSchedules = async () => {
  const { data, error } = await supabase
    .from('schedules')
    .select('*')
    .order('day_of_week', { ascending: true })
  if (error) throw error
  return data?.length ? data : getDefaultSchedules()
}

export const getDefaultSchedules = () => {
  const defaultHours = [
    { day_of_week: 1, start_time: '09:00', end_time: '19:00', active: true },
    { day_of_week: 2, start_time: '09:00', end_time: '19:00', active: true },
    { day_of_week: 3, start_time: '09:00', end_time: '19:00', active: true },
    { day_of_week: 4, start_time: '09:00', end_time: '19:00', active: true },
    { day_of_week: 5, start_time: '09:00', end_time: '19:00', active: true },
    { day_of_week: 6, start_time: '09:00', end_time: '14:00', active: true },
    { day_of_week: 0, start_time: '09:00', end_time: '19:00', active: false },
  ]
  return defaultHours
}

export const updateSchedules = async (schedules) => {
  const { data, error } = await supabase
    .from('schedules')
    .upsert(schedules)
    .select()
  if (error) throw error
  return data
}

export const getBlockedDates = async (fromDate, toDate) => {
  let query = supabase.from('blocked_dates').select('*')
  if (fromDate) query = query.gte('date', fromDate)
  if (toDate) query = query.lte('date', toDate)
  query = query.order('date', { ascending: true })
  const { data, error } = await query
  if (error) throw error
  return data || []
}

export const createBlockedDate = async (blockedDate) => {
  const { data, error } = await supabase
    .from('blocked_dates')
    .insert(blockedDate)
    .select()
    .single()
  if (error) throw error
  return data
}

export const deleteBlockedDate = async (id) => {
  const { error } = await supabase
    .from('blocked_dates')
    .delete()
    .eq('id', id)
  if (error) throw error
  return true
}

export const createNotification = async (notif) => {
  const { data, error } = await supabase
    .from('notifications')
    .insert(notif)
    .select()
    .single()
  if (error) throw error
  return data
}
