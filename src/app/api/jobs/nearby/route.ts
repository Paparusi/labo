import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'

const nearbySchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  radius: z.number().min(1).max(200).default(10),
})

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
  const { success } = rateLimit(`jobs:${ip}`, 30, 60_000)
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const supabase = await createClient()
  const { searchParams } = request.nextUrl

  const parsed = nearbySchema.safeParse({
    lat: parseFloat(searchParams.get('lat') || ''),
    lng: parseFloat(searchParams.get('lng') || ''),
    radius: searchParams.get('radius') ? parseFloat(searchParams.get('radius')!) : undefined,
  })

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })
  }

  const { lat, lng, radius } = parsed.data

  const { data, error } = await supabase.rpc('nearby_jobs', {
    lat,
    lng,
    radius_meters: radius * 1000,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ jobs: data })
}
