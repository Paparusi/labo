'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useGeolocation } from '@/hooks/useGeolocation'
import Header from '@/components/layout/Header'
import MapView from '@/components/map/MapView'
import JobCard from '@/components/jobs/JobCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin, List, Loader2, Navigation, AlertCircle } from 'lucide-react'
import type { User, Job } from '@/types'

export default function WorkerDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map')
  const [radius, setRadius] = useState(5)
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set())
  const { latitude, longitude, error: geoError, loading: geoLoading, refresh: refreshGeo } = useGeolocation()
  const supabase = createClient()

  // Fetch user
  useEffect(() => {
    async function fetchUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data } = await supabase.from('users').select('*').eq('id', authUser.id).single()
        setUser(data)
      }
    }
    fetchUser()
  }, [supabase])

  // Fetch nearby jobs
  const fetchJobs = useCallback(async () => {
    if (!latitude || !longitude) return
    setLoading(true)

    const { data, error } = await supabase.rpc('nearby_jobs', {
      lat: latitude,
      lng: longitude,
      radius_meters: radius * 1000,
    })

    if (data) {
      setJobs(data.map((j: Record<string, unknown>) => ({
        ...j,
        factory: { company_name: j.company_name, logo_url: j.logo_url },
        _distance_km: j.distance_km,
      })))
    }
    setLoading(false)
  }, [latitude, longitude, radius, supabase])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  // Fetch applied jobs
  useEffect(() => {
    async function fetchApplied() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return
      const { data } = await supabase
        .from('applications')
        .select('job_id')
        .eq('worker_id', authUser.id)
      if (data) {
        setAppliedJobs(new Set(data.map(a => a.job_id)))
      }
    }
    fetchApplied()
  }, [supabase])

  const handleApply = async (jobId: string) => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return

    const { error } = await supabase.from('applications').insert({
      job_id: jobId,
      worker_id: authUser.id,
      status: 'pending',
    })

    if (!error) {
      setAppliedJobs(prev => new Set(prev).add(jobId))

      // Create notification for factory
      const job = jobs.find(j => j.id === jobId)
      if (job) {
        await supabase.from('notifications').insert({
          user_id: job.factory_id,
          type: 'application_received',
          title: 'Có ứng viên mới',
          message: `Có người ứng tuyển vị trí "${job.title}"`,
          data: { job_id: jobId, worker_id: authUser.id },
        })
      }
    }
  }

  const mapMarkers = jobs.map(job => ({
    id: job.id,
    latitude: job.latitude!,
    longitude: job.longitude!,
    title: job.title,
    subtitle: job.factory?.company_name || '',
    type: 'job' as const,
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />

      <div className="container mx-auto px-4 py-6">
        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Việc làm gần bạn</h1>
            <p className="text-gray-500 text-sm mt-1">
              {latitude && longitude ? (
                <span className="flex items-center gap-1">
                  <Navigation className="h-3.5 w-3.5" />
                  Đã xác định vị trí của bạn
                </span>
              ) : geoLoading ? (
                'Đang xác định vị trí...'
              ) : (
                <span className="flex items-center gap-1 text-amber-600">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {geoError || 'Cho phép truy cập vị trí để xem việc làm gần bạn'}
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Radius selector */}
            <Select value={String(radius)} onValueChange={(v) => setRadius(Number(v))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 km</SelectItem>
                <SelectItem value="5">5 km</SelectItem>
                <SelectItem value="10">10 km</SelectItem>
                <SelectItem value="20">20 km</SelectItem>
              </SelectContent>
            </Select>

            {/* View toggle */}
            <div className="flex bg-white border rounded-lg">
              <Button
                variant={viewMode === 'map' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('map')}
                className={viewMode === 'map' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              >
                <MapPin className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Job count */}
        <div className="mb-4">
          <Badge variant="secondary" className="text-sm">
            {jobs.length} việc làm trong bán kính {radius}km
          </Badge>
        </div>

        {/* Content */}
        {geoLoading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : viewMode === 'map' ? (
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Map */}
            <div className="lg:col-span-3">
              <MapView
                center={longitude && latitude ? [longitude, latitude] : undefined}
                zoom={13}
                markers={mapMarkers}
                radiusKm={radius}
                userLocation={latitude && longitude ? { latitude, longitude } : null}
                className="w-full h-[500px] lg:h-[600px]"
              />
            </div>

            {/* Job List Sidebar */}
            <div className="lg:col-span-2 space-y-3 max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Không có việc làm nào trong bán kính {radius}km</p>
                  <Button variant="outline" className="mt-3" onClick={() => setRadius(prev => Math.min(prev + 5, 20))}>
                    Mở rộng bán kính
                  </Button>
                </div>
              ) : (
                jobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onApply={handleApply}
                    applied={appliedJobs.has(job.id)}
                  />
                ))
              )}
            </div>
          </div>
        ) : (
          /* List View */
          <div className="space-y-3 max-w-3xl">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>Không có việc làm nào trong bán kính {radius}km</p>
              </div>
            ) : (
              jobs.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  onApply={handleApply}
                  applied={appliedJobs.has(job.id)}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
