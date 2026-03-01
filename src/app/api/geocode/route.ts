import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  // Rate limit: 30 requests per minute per IP
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const { success } = rateLimit(`geocode:${ip}`, 30, 60_000)
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const q = request.nextUrl.searchParams.get('q')
  if (!q || q.length < 2) {
    return NextResponse.json({ features: [] })
  }

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  if (!token) {
    return NextResponse.json({ error: 'Mapbox token not configured' }, { status: 500 })
  }

  const res = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${token}&country=vn&language=vi&limit=5&types=address,place,locality,neighborhood`
  )

  if (!res.ok) {
    return NextResponse.json({ features: [] })
  }

  const data = await res.json()
  return NextResponse.json({ features: data.features || [] })
}
