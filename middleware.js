import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabase } from '@/lib/supabase/client'

export async function middleware(request) {
  const { pathname } = request.nextUrl

  const isDashboard = pathname.startsWith('/dashboard')
  const isLogin = pathname.startsWith('/login')

  if (!isDashboard && !isLogin) return NextResponse.next()

  try {
    const cookieStore = cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value
    const refreshToken = cookieStore.get('sb-refresh-token')?.value

    const hasSession = !!accessToken

    if (isLogin) {
      if (hasSession) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      return NextResponse.next()
    }

    if (isDashboard) {
      if (!hasSession) {
        const url = new URL('/login', request.url)
        url.searchParams.set('redirect', pathname)
        return NextResponse.redirect(url)
      }
      return NextResponse.next()
    }
  } catch (e) {
    console.error('middleware error:', e.message)
    if (isDashboard) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}
