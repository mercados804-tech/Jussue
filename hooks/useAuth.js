'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

const DEV_ADMIN_EMAIL = 'admin@peluqueria.com'
const DEV_ADMIN_PASSWORD = '123456'

const setDevSession = () => {
  const now = new Date()
  now.setFullYear(now.getFullYear() + 1)
  document.cookie = `sb-access-token=dev-admin; path=/; expires=${now.toUTCString()}`
  document.cookie = `sb-refresh-token=dev-admin; path=/; expires=${now.toUTCString()}`
}

const clearDevSession = () => {
  document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  document.cookie = 'sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
}

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
      setLoading(false)
    }
    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null)
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    const normalizedEmail = String(email || '').trim().toLowerCase()
    const normalizedPassword = String(password || '')

    if (
      process.env.NODE_ENV !== 'production' &&
      normalizedEmail === DEV_ADMIN_EMAIL &&
      normalizedPassword === DEV_ADMIN_PASSWORD
    ) {
      setDevSession()
      const devUser = { email: DEV_ADMIN_EMAIL, id: 'dev-admin' }
      setUser(devUser)
      return devUser
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data.user
  }

  const signOut = async () => {
    clearDevSession()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
  }

  return { user, loading, signIn, signOut }
}
