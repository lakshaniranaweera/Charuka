import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'

type CookieToSet = { name: string; value: string; options?: CookieOptions }

/**
 * Refreshes the Supabase auth session on every request and guards the
 * /admin routes (except the auth pages).
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isAuthRoute =
    pathname.startsWith('/admin/login') ||
    pathname.startsWith('/admin/forgot-password') ||
    pathname.startsWith('/admin/reset-password')
  const isAdminRoute = pathname.startsWith('/admin')

  // Not signed in and trying to reach a protected admin page → login
  if (isAdminRoute && !isAuthRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    url.searchParams.set('redirectedFrom', pathname)
    return NextResponse.redirect(url)
  }

  // Already signed in and visiting the login page → dashboard
  if (user && pathname === '/admin/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
