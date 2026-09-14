import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request) {
  const { pathname } = request.nextUrl

  const isDashboard = pathname.startsWith('/dashboard')
  const isLogin = pathname.startsWith('/login')

  if (!isDashboard && !isLogin) return NextResponse.next()

  const response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  try {
    const { data: { user } } = await supabase.auth.getUser()
    const hasSession = !!user

    if (isLogin) {
      if (hasSession) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      return response
    }

    if (isDashboard) {
      if (!hasSession) {
        const url = new URL('/login', request.url)
        url.searchParams.set('redirect', pathname)
        return NextResponse.redirect(url)
      }
      return response
    }
  } catch (e) {
    console.error('middleware error:', e.message)
    if (isDashboard) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}
