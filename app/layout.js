import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata = {
  title: 'Alisados Profesionales | Reserva tu Turno',
  description: 'Peluquería especializada exclusivamente en alisados de cabello. Cabello liso, brillante y saludable. Reserva tu turno de forma rápida y sencilla.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#0a0a0a',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
