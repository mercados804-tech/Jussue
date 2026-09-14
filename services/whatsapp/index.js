const WHATSAPP_API_URL = `https://graph.facebook.com`

export const sendWhatsAppMessage = async (to, templateName, templateParams = []) => {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const apiVersion = process.env.WHATSAPP_API_VERSION || 'v20.0'

  if (!accessToken || !phoneNumberId) {
    console.warn('WhatsApp API no configurada')
    return { success: false, error: 'WhatsApp API no configurada' }
  }

  try {
    const url = `${WHATSAPP_API_URL}/${apiVersion}/${phoneNumberId}/messages`
    const body = {
      messaging_product: 'whatsapp',
      to: to.startsWith('+') ? to.replace('+', '') : to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'es_AR' },
        components: templateParams.length > 0 ? [
          {
            type: 'body',
            parameters: templateParams.map((p) => ({ type: 'text', text: String(p) })),
          },
        ] : undefined,
      },
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message || 'Error envío WhatsApp')
    return { success: true, data }
  } catch (err) {
    console.error('Error sendWhatsApp:', err.message)
    return { success: false, error: err.message }
  }
}

export const sendTextMessage = async (to, text) => {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const apiVersion = process.env.WHATSAPP_API_VERSION || 'v20.0'

  if (!accessToken || !phoneNumberId) {
    console.warn('WhatsApp API no configurada')
    return { success: false }
  }

  try {
    const url = `${WHATSAPP_API_URL}/${apiVersion}/${phoneNumberId}/messages`
    const body = {
      messaging_product: 'whatsapp',
      to: to.startsWith('+') ? to.replace('+', '') : to,
      text: { preview_url: false, body: text },
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message || 'Error envío WhatsApp')
    return { success: true, data }
  } catch (err) {
    console.error('Error sendTextMessage:', err.message)
    return { success: false, error: err.message }
  }
}

export const buildAutoReplyText = (businessName, reserveUrl) => {
  return `✨ ¡Hola! Bienvenida a ${businessName}. Somos especialistas en alisados 💕\n\nPara consultar los días y horarios disponibles y reservar tu turno, ingresá acá:\n🔗 ${reserveUrl}\n\nPodés elegir directamente el día y horario que prefieras.`
}

export const buildConfirmationText = (serviceName, date, time, deposit, remaining) => {
  return `✨ ¡Tu turno está confirmado!\n\nTu turno para ${serviceName} quedó confirmado.\n📅 Fecha: ${date}\n⏰ Hora: ${time}\n💰 Seña recibida: ${deposit}\n💰 Saldo pendiente: ${remaining}\n\n¡Te esperamos! 💕`
}

export const buildReminder24hText = (serviceName, date, time) => {
  return `💕 Recordatorio de tu turno.\n\nMañana tenés tu turno de ${serviceName}.\n📅 ${date}\n⏰ ${time}\n\n¡Te esperamos!`
}

export const buildReminder1hText = (time) => {
  return `✨ Tu turno es dentro de 1 hora.\n⏰ ${time}\n¡Nos vemos! 💕`
}

/* ============================================================
   MODO GRATUITO: Links wa.me (sin Meta Cloud API)
   Genera enlaces que abren WhatsApp Web/App con texto prearmado
   Tanto para la DUEÑA (contactar clienta) como para CLIENTES.
   ============================================================ */
const normalizePhone = (phone) => {
  if (!phone) return ''
  return String(phone).replace(/[^0-9]/g, '')
}

export const buildWhatsAppLink = (phone, text = '') => {
  const clean = normalizePhone(phone)
  if (!clean) return '#'
  const encoded = encodeURIComponent(text)
  return `https://wa.me/${clean}?text=${encoded}`
}

export const getAdminContactLink = (businessPhone, clientName = 'Hola') => {
  return buildWhatsAppLink(
    businessPhone,
    `Hola 💕 Soy ${clientName}. Tengo una consulta sobre mi turno de alisado.`
  )
}

/* Prearmados de mensajes que la DUEÑA envía 1-click por wa.me: */
export const getSendConfirmationLink = (customerPhone, serviceName, date, time, deposit, remaining) => ({
  phone: normalizePhone(customerPhone),
  link: buildWhatsAppLink(customerPhone, buildConfirmationText(serviceName, date, time, deposit, remaining)),
})

export const getSendReminder24hLink = (customerPhone, serviceName, date, time) => ({
  phone: normalizePhone(customerPhone),
  link: buildWhatsAppLink(customerPhone, buildReminder24hText(serviceName, date, time)),
})

export const getSendReminder1hLink = (customerPhone, time) => ({
  phone: normalizePhone(customerPhone),
  link: buildWhatsAppLink(customerPhone, buildReminder1hText(time)),
})

export const getAdminContactCustomerLink = (customerPhone, customerName = '') => ({
  phone: normalizePhone(customerPhone),
  link: buildWhatsAppLink(
    customerPhone,
    `Hola ${customerName} 💕, te escribo de la peluquería por tu turno de alisado.`
  ),
})

/* Modo seguro: chequear si la API Cloud está configurada.
   Si no lo está, usamos wa.me modo manual. */
export const isCloudApiConfigured = () =>
  !!process.env.WHATSAPP_ACCESS_TOKEN &&
  process.env.WHATSAPP_ACCESS_TOKEN !== 'your-whatsapp-access-token' &&
  !!process.env.WHATSAPP_PHONE_NUMBER_ID &&
  process.env.WHATSAPP_PHONE_NUMBER_ID !== 'your-phone-number-id'
