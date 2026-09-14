'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { AnimatePresence, motion } from 'framer-motion'
import {
  HomeIcon, CalendarIcon, SettingsIcon, LogoutIcon, SparklesIcon, ClockIcon, ScissorsIcon,
} from '@/components/Icons'
import { cn } from '@/utils'

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: HomeIcon },
  { href: '/dashboard/agenda', label: 'Agenda', icon: CalendarIcon },
  { href: '/dashboard/horarios', label: 'Horarios', icon: ClockIcon },
  { href: '/dashboard/servicio', label: 'Servicio', icon: ScissorsIcon },
  { href: '/dashboard/configuracion', label: 'Ajustes', icon: SettingsIcon },
]

export default function DashboardLayout({ children }) {
  const { user, loading, signOut } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-gold-500/30 border-t-gold-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-dark-950">
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/5 bg-dark-900/60 backdrop-blur-xl">
        <div className="p-5 border-b border-white/5">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-500/20 to-champagne-500/20 border border-gold-500/30 flex items-center justify-center">
              <SparklesIcon className="w-4 h-4 text-gold-400" />
            </div>
            <div className="font-serif font-semibold text-white">Admin</div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard' && pathname?.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5',
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all"
          >
            <LogoutIcon className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden sticky top-0 z-30 border-b border-white/5 bg-dark-900/80 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 py-3">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-500/20 to-champagne-500/20 border border-gold-500/30 flex items-center justify-center">
                <SparklesIcon className="w-4 h-4 text-gold-400" />
              </div>
              <span className="font-serif font-semibold text-white text-sm">Admin</span>
            </Link>
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-lg hover:bg-white/5 text-gray-400"
              aria-label="Abrir menú"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>
        </header>

        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              />
              <motion.aside
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="lg:hidden fixed right-0 top-0 h-full w-72 z-50 bg-dark-900 border-l border-white/10 flex flex-col"
              >
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                  <div className="font-serif font-semibold text-white">Menú</div>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-2 rounded-lg hover:bg-white/5 text-gray-400"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <nav className="flex-1 p-3 space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium',
                          isActive
                            ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20'
                            : 'text-gray-300 hover:bg-white/5',
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    )
                  })}
                </nav>
                <div className="p-3 border-t border-white/5">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/5"
                  >
                    <LogoutIcon className="w-4 h-4" />
                    Cerrar sesión
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
