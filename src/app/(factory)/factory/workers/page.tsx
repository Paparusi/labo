'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/layout/Header'
import MapView from '@/components/map/MapView'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin, List, Loader2, User, Star } from 'lucide-react'
import { getDistanceLabel } from '@/lib/geo'
import type { User as UserType, FactoryProfile } from '@/types'

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
  const [user, setUser] = useState<UserType | null>(null)
  const [factory, setFactory] = useState<FactoryProfile | null>(null)
  const [workers, setWorkers] = useState<NearbyWorker[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'map' | 'list'>('list')
  const [radius, setRadius] = useState(10)
  const [availFilter, setAvailFilter] = useState('all')
  const supabase = createClient()

  useEffect(() => {
    async function fetchUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return
      const { data: userData } = await supabase.from('users').select('*').eq('id', authUser.id).single()
      setUser(userData)
      const { data: factoryData } = await supabase.from('factory_profiles').select('*').eq('user_id', authUser.id).single()
      setFactory(factoryData)
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
    subtitle: `${w.distance_km}km - ${w.skills?.slice(0, 2).join(', ') || 'Cong nhan'}`,
    type: 'worker' as const,
  }))

  const availLabels: Record<string, string> = {
    immediate: 'San sang ngay',
    one_week: '1 tuan',
    one_month: '1 thang',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cong nhan gan nha may</h1>
            <p className="text-sm text-gray-500 mt-1">Tim cong nhan phu hop trong khu vuc cua ban</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={availFilter} onValueChange={setAvailFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Kha dung" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tat ca</SelectItem>
                <SelectItem value="immediate">San sang ngay</SelectItem>
                <SelectItem value="one_week">1 tuan</SelectItem>
                <SelectItem value="one_month">1 thang</SelectItem>
              </SelectContent>
            </Select>
            <Select value={String(radius)} onValueChange={(v) => setRadius(Number(v))}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 km</SelectItem>
                <SelectItem value="10">10 km</SelectItem>
                <SelectItem value="20">20 km</SelectItem>
                <SelectItem value="50">50 km</SelectItem>
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

        <Badge variant="secondary" className="mb-4">{workers.length} cong nhan trong ban kinh {radius}km</Badge>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          </div>
        ) : !factory?.latitude ? (
          <div className="text-center py-12 text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Vui long cap nhat vi tri nha may trong ho so de tim cong nhan gan day</p>
            <Button asChild className="mt-3">
              <a href="/factory/profile">Cap nhat ho so</a>
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
                        <h3 className="font-semibold text-gray-900">{worker.full_name}</h3>
                        <p className={`text-sm ${distInfo.color} font-medium`}>
                          <MapPin className="h-3.5 w-3.5 inline mr-1" />
                          {worker.distance_km} km - {distInfo.transport}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <span>{worker.experience_years} nam KN</span>
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
