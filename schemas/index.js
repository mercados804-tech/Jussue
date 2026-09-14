import * as Yup from 'yup'

export const customerSchema = Yup.object().shape({
  customer_name: Yup.string()
    .trim()
    .min(2, 'El nombre es muy corto')
    .max(50, 'El nombre es muy largo')
    .required('El nombre es obligatorio'),
  customer_last_name: Yup.string()
    .trim()
    .min(2, 'El apellido es muy corto')
    .max(50, 'El apellido es muy largo')
    .required('El apellido es obligatorio'),
  whatsapp: Yup.string()
    .trim()
    .matches(/^\+?[\d\s-]{8,}$/, 'Número de WhatsApp inválido')
    .required('El WhatsApp es obligatorio'),
  email: Yup.string()
    .trim()
    .email('Email inválido')
    .required('El email es obligatorio'),
  notes: Yup.string()
    .trim()
    .max(500, 'Máximo 500 caracteres'),
})

export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .trim()
    .email('Email inválido')
    .required('El email es obligatorio'),
  password: Yup.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La contraseña es obligatoria'),
})

export const serviceSchema = Yup.object().shape({
  service_name: Yup.string().trim().required('El nombre es obligatorio'),
  service_price: Yup.number()
    .positive('El precio debe ser positivo')
    .required('El precio es obligatorio'),
  deposit_amount: Yup.number()
    .positive('La seña debe ser positiva')
    .required('La seña es obligatoria')
    .test('deposit-lt-price', 'La seña debe ser menor al precio', function (value) {
      return value < this.parent.service_price
    }),
  duration: Yup.number()
    .positive('La duración debe ser positiva')
    .required('La duración es obligatoria'),
})

export const businessSchema = Yup.object().shape({
  business_name: Yup.string().trim().required('El nombre es obligatorio'),
  whatsapp: Yup.string().trim(),
  description: Yup.string().trim(),
  address: Yup.string().trim(),
  bank_name: Yup.string().trim(),
  account_holder: Yup.string().trim(),
  cbu: Yup.string().trim(),
  alias: Yup.string().trim(),
})

export const scheduleSchema = Yup.object().shape({
  day_of_week: Yup.number().min(0).max(6).required(),
  start_time: Yup.string().required(),
  end_time: Yup.string().required(),
  active: Yup.boolean(),
})
