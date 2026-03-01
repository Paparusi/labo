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

  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Public routes (no auth required)
  const isPublicRoute =
    path === '/' ||
    path === '/login' ||
    path === '/register' ||
    path === '/pricing' ||
    path === '/terms' ||
    path === '/privacy' ||
    path === '/forgot-password' ||
    path === '/reset-password' ||
    path.startsWith('/auth/') ||
    path.startsWith('/api/') ||
    path.startsWith('/factory/') && /^\/factory\/[^/]+$/.test(path) || // /factory/[id] public profile
    path.startsWith('/worker/') && /^\/worker\/[^/]+$/.test(path) && !path.includes('/dashboard') && !path.includes('/jobs') && !path.includes('/messages') && !path.includes('/applications') && !path.includes('/notifications') && !path.includes('/profile') && !path.includes('/saved-jobs') // /worker/[id] public profile

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
      url.pathname =
        role === 'admin' ? '/admin' :
        role === 'factory' ? '/factory/dashboard' :
        '/worker/dashboard'
      return NextResponse.redirect(url)
    }

    // Admin route protection - only admin role can access /admin/*
    if (path.startsWith('/admin') && role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = role === 'factory' ? '/factory/dashboard' : '/worker/dashboard'
      return NextResponse.redirect(url)
    }

    // Worker trying to access factory routes (except public profiles)
    if (path.startsWith('/factory/dashboard') || path.startsWith('/factory/jobs') || path.startsWith('/factory/workers') || path.startsWith('/factory/messages') || path.startsWith('/factory/notifications') || path.startsWith('/factory/profile') || path.startsWith('/factory/subscription')) {
      if (role !== 'factory' && role !== 'admin') {
        const url = request.nextUrl.clone()
        url.pathname = '/worker/dashboard'
        return NextResponse.redirect(url)
      }
    }

    // Factory trying to access worker routes (except public profiles)
    if (path.startsWith('/worker/dashboard') || path.startsWith('/worker/jobs') || path.startsWith('/worker/messages') || path.startsWith('/worker/applications') || path.startsWith('/worker/notifications') || path.startsWith('/worker/profile') || path.startsWith('/worker/saved-jobs')) {
      if (role !== 'worker' && role !== 'admin') {
        const url = request.nextUrl.clone()
        url.pathname = '/factory/dashboard'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
