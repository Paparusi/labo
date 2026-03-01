'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'
import Header from '@/components/layout/Header'
import MapView from '@/components/map/MapView'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin, List, Loader2, User, Star, MessageSquare } from 'lucide-react'
import { getDistanceLabel } from '@/lib/geo'
import { getMaxRadius } from '@/lib/subscription'
import type { FactoryProfile, SubscriptionPlan } from '@/types'
import StarRating from '@/components/shared/StarRating'

interface NearbyWorker {
  id: string
  user_id: string
  full_name: string
  gender: string | null
  skills: string[]
  experience_years: number
  availability: string
  avatar_url: string | null
  bio: string | null
  latitude: number
  longitude: number
  distance_km: number
}

export default function FactoryWorkersPage() {
  const router = useRouter()
  const { user } = useUser()
  const [factory, setFactory] = useState<FactoryProfile | null>(null)
  const [workers, setWorkers] = useState<NearbyWorker[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'map' | 'list'>('list')
  const [radius, setRadius] = useState(10)
  const [availFilter, setAvailFilter] = useState('all')
  const [maxRadius, setMaxRadius] = useState(50)
  const [ratings, setRatings] = useState<Record<string, {avg_rating: number, review_count: number}>>({})
  const supabase = createClient()

  useEffect(() => {
    async function fetchUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      const [factoryResult, subResult] = await Promise.all([
        supabase.from('factory_profiles').select('*').eq('user_id', authUser.id).single(),
        supabase.from('subscriptions').select('*, plan:subscription_plans(*)').eq('factory_id', authUser.id).order('created_at', { ascending: false }).limit(1).single(),
      ])

      setFactory(factoryResult.data)

      const planMaxRadius = getMaxRadius(subResult.data?.plan as SubscriptionPlan | null)
      setMaxRadius(planMaxRadius)
      setRadius(Math.min(10, planMaxRadius))
    }
    fetchUser()
  }, [supabase])

  const fetchWorkers = useCallback(async () => {
    if (!factory?.latitude || !factory?.longitude) return
    setLoading(true)

    const { data } = await supabase.rpc('nearby_workers', {
      lat: factory.latitude,
      lng: factory.longitude,
      radius_meters: radius * 1000,
    })

    if (data) {
      let filtered = data as NearbyWorker[]
      if (availFilter !== 'all') {
        filtered = filtered.filter(w => w.availability === availFilter)
      }
      setWorkers(filtered)

      // Batch fetch ratings: single query instead of N+1
      if (filtered.length > 0) {
        const userIds = filtered.map(w => w.user_id)
        const { data: reviewsData } = await supabase
          .from('reviews')
          .select('to_user_id, rating')
          .in('to_user_id', userIds)

        const ratingsData: Record<string, {avg_rating: number, review_count: number}> = {}
        if (reviewsData) {
          const grouped: Record<string, number[]> = {}
          reviewsData.forEach(r => {
            if (!grouped[r.to_user_id]) grouped[r.to_user_id] = []
            grouped[r.to_user_id].push(r.rating)
          })
          Object.entries(grouped).forEach(([userId, ratings]) => {
            ratingsData[userId] = {
              avg_rating: ratings.reduce((a, b) => a + b, 0) / ratings.length,
              review_count: ratings.length,
            }
          })
        }
        setRatings(ratingsData)
      }
    }
    setLoading(false)
  }, [factory, radius, availFilter, supabase])

  useEffect(() => {
    if (factory) fetchWorkers()
  }, [factory, fetchWorkers])

  const mapMarkers = workers.map(w => ({
    id: w.id,
    latitude: w.latitude,
    longitude: w.longitude,
    title: w.full_name,
    subtitle: `${w.distance_km}km - ${w.skills?.slice(0, 2).join(', ') || 'Công nhân'}`,
    type: 'worker' as const,
  }))

  const handleMessage = async (workerId: string) => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return
    const { data: convId } = await supabase.rpc('get_or_create_conversation', {
      user_a: authUser.id,
      user_b: workerId,
    })
    if (convId) {
      router.push(`/factory/messages/${convId}`)
    }
  }

  const availLabels: Record<string, string> = {
    immediate: 'Sẵn sàng ngay',
    one_week: '1 tuần',
    one_month: '1 tháng',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Công nhân gần nhà máy</h1>
            <p className="text-sm text-gray-500 mt-1">Tìm công nhân phù hợp trong khu vực của bạn</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={availFilter} onValueChange={setAvailFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Khả dụng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="immediate">Sẵn sàng ngay</SelectItem>
                <SelectItem value="one_week">1 tuần</SelectItem>
                <SelectItem value="one_month">1 tháng</SelectItem>
              </SelectContent>
            </Select>
            <Select value={String(radius)} onValueChange={(v) => setRadius(Number(v))}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 50].filter(r => r <= maxRadius).map(r => (
                  <SelectItem key={r} value={String(r)}>{r} km</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex bg-white border rounded-lg">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-emerald-600' : ''}
              ><List className="h-4 w-4" /></Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('map')}
                className={viewMode === 'map' ? 'bg-emerald-600' : ''}
              ><MapPin className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>

        <Badge variant="secondary" className="mb-4">{workers.length} công nhân trong bán kính {radius}km</Badge>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          </div>
        ) : !factory?.latitude ? (
          <div className="text-center py-12 text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Vui lòng cập nhật vị trí nhà máy trong hồ sơ để tìm công nhân gần đây</p>
            <Button asChild className="mt-3">
              <a href="/factory/profile">Cập nhật hồ sơ</a>
            </Button>
          </div>
        ) : viewMode === 'map' ? (
          <MapView
            center={[factory.longitude!, factory.latitude!]}
            zoom={12}
            markers={mapMarkers}
            radiusKm={radius}
            userLocation={{ latitude: factory.latitude!, longitude: factory.longitude! }}
            className="w-full h-[600px]"
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workers.map(worker => {
              const distInfo = getDistanceLabel(worker.distance_km)
              return (
                <Card key={worker.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/worker/${worker.user_id}`} className="font-semibold text-gray-900 hover:text-emerald-600">{worker.full_name}</Link>
                        {ratings[worker.user_id] && ratings[worker.user_id].review_count > 0 && (
                          <div className="flex items-center gap-1 mb-1">
                            <StarRating rating={ratings[worker.user_id].avg_rating} size="sm" />
                            <span className="text-xs text-gray-500">
                              ({ratings[worker.user_id].review_count})
                            </span>
                          </div>
                        )}
                        <p className={`text-sm ${distInfo.color} font-medium`}>
                          <MapPin className="h-3.5 w-3.5 inline mr-1" />
                          {worker.distance_km} km - {distInfo.transport}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <span>{worker.experience_years} năm KN</span>
                          <span>-</span>
                          <Badge variant="outline" className="text-xs py-0">
                            {availLabels[worker.availability] || worker.availability}
                          </Badge>
                        </div>
                        {worker.skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {worker.skills.slice(0, 4).map(s => (
                              <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                            ))}
                          </div>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-3 w-full"
                          onClick={() => handleMessage(worker.user_id)}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />Nhắn tin
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
