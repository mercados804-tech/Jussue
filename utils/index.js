export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0)
}

export const formatDate = (date, options = {}) => {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(`${date}T12:00:00`) : date
  return d.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options,
  })
}

export const formatDateLong = (date) => {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(`${date}T12:00:00`) : date
  return d.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export const formatTime = (time) => {
  if (!time) return ''
  const [h, m] = time.split(':')
  return `${h}:${m}`
}

export const getTodayISO = () => {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const isSameDay = (d1, d2) => {
  if (!d1 || !d2) return false

  const parseLocalDate = (value) => {
    if (value instanceof Date) {
      return new Date(value.getFullYear(), value.getMonth(), value.getDate())
    }

    if (typeof value === 'string') {
      const [year, month, day] = value.split('-').map(Number)
      if (!year || !month || !day) return null
      return new Date(year, month - 1, day)
    }

    return null
  }

  const date1 = parseLocalDate(d1)
  const date2 = parseLocalDate(d2)
  if (!date1 || !date2) return false

  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

export const getDayOfWeekNames = () => [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado',
]

export const getMonthNames = () => [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export const getShortDayNames = () => ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá']

export const addDays = (date, days) => {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export const startOfMonth = (date) => {
  const d = new Date(date)
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

export const endOfMonth = (date) => {
  const d = new Date(date)
  d.setMonth(d.getMonth() + 1)
  d.setDate(0)
  d.setHours(23, 59, 59, 999)
  return d
}

export const getStartOfWeek = (date) => {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

export const getEndOfWeek = (date) => {
  const d = getStartOfWeek(date)
  d.setDate(d.getDate() + 6)
  d.setHours(23, 59, 59, 999)
  return d
}

export const getStatusLabel = (status) => {
  const map = {
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    cancelled: 'Cancelado',
    completed: 'Realizado',
    rejected: 'Rechazado',
  }
  return map[status] || status
}

export const getStatusColorClass = (status) => {
  const map = {
    pending: 'status-pending',
    confirmed: 'status-confirmed',
    cancelled: 'status-cancelled',
    completed: 'status-completed',
    rejected: 'status-cancelled',
  }
  return map[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'
}

export const generateTimeSlots = (startTime, endTime, durationMin = 180, gapMin = 30) => {
  const slots = []
  if (!startTime || !endTime) return slots
  const [startH, startM] = startTime.split(':').map(Number)
  const [endH, endM] = endTime.split(':').map(Number)
  let currentMin = startH * 60 + (startM || 0)
  const endMinVal = endH * 60 + (endM || 0)

  while (currentMin + durationMin <= endMinVal) {
    const h = Math.floor(currentMin / 60)
    const m = currentMin % 60
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    currentMin += durationMin + gapMin
  }
  return slots
}

export const cn = (...classes) => classes.filter(Boolean).join(' ')

export const validateFile = (file) => {
  if (!file) return { valid: false, error: 'No hay archivo' }
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
  const maxSize = 10 * 1024 * 1024
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Formato no permitido. Usa JPG, PNG, WEBP o PDF' }
  }
  if (file.size > maxSize) {
    return { valid: false, error: 'El archivo es muy grande. Máximo 10MB' }
  }
  return { valid: true }
}

export const toISODate = (date) => {
  if (!date) return ''

  if (typeof date === 'string') {
    const [year, month, day] = date.split('-').map(Number)
    if (year && month && day) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }
    return date
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
