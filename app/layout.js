import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata = {
  title: 'Jusse Cristal | Reserva tu Turno',
  description: 'Jusse Cristal: belleza, estilo y cuidado profesional. Reserva tu turno de forma rápida y sencilla.',
  icons: {
    icon: '/icon.jpg',
    shortcut: '/icon.jpg',
  },
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
