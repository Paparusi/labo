import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Get user role to redirect
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profile?.role === 'admin') {
          return NextResponse.redirect(`${origin}/admin`)
        }
        if (profile?.role === 'factory') {
          return NextResponse.redirect(`${origin}/factory/dashboard`)
        }
        if (profile?.role === 'worker') {
          return NextResponse.redirect(`${origin}/worker/dashboard`)
        }

        // New Google user without role - send to register to complete profile
        return NextResponse.redirect(`${origin}/register`)
      }
    }
  }

  // Auth error - redirect to login
  return NextResponse.redirect(`${origin}/login?error=auth`)
}
