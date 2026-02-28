import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
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

  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Public routes
  const publicRoutes = ['/', '/login', '/register', '/pricing']
  const isPublicRoute = publicRoutes.some(route => path === route) || path.startsWith('/api/auth')

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', path)
    return NextResponse.redirect(url)
  }

  // If logged in, check role-based access
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role

    // Redirect logged-in users away from auth pages
    if (path === '/login' || path === '/register') {
      const url = request.nextUrl.clone()
      url.pathname = role === 'worker' ? '/worker/dashboard' : '/factory/dashboard'
      return NextResponse.redirect(url)
    }

    // Worker trying to access factory routes
    if (path.startsWith('/factory') && role !== 'factory' && role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/worker/dashboard'
      return NextResponse.redirect(url)
    }

    // Factory trying to access worker routes
    if (path.startsWith('/worker') && role !== 'worker' && role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/factory/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
