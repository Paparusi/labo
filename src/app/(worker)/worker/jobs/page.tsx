'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useGeolocation } from '@/hooks/useGeolocation'
import Header from '@/components/layout/Header'
import JobCard from '@/components/jobs/JobCard'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Loader2, SlidersHorizontal } from 'lucide-react'
import type { User, Job } from '@/types'

const INDUSTRIES = [
  { value: 'all', label: 'Tat ca nganh' },
  { value: 'electronics', label: 'Dien tu' },
  { value: 'garment', label: 'May mac' },
  { value: 'footwear', label: 'Giay dep' },
  { value: 'food', label: 'Thuc pham' },
  { value: 'furniture', label: 'Noi that' },
  { value: 'mechanical', label: 'Co khi' },
  { value: 'packaging', label: 'Dong goi' },
  { value: 'plastics', label: 'Nhua' },
]

export default function WorkerJobsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [industry, setIndustry] = useState('all')
  const [radius, setRadius] = useState(10)
  const [shiftFilter, setShiftFilter] = useState('all')
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set())
  const { latitude, longitude } = useGeolocation()
  const supabase = createClient()

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

  const fetchJobs = useCallback(async () => {
    setLoading(true)

    if (latitude && longitude) {
      const { data } = await supabase.rpc('nearby_jobs', {
        lat: latitude,
        lng: longitude,
        radius_meters: radius * 1000,
      })
      if (data) {
        let filtered = data.map((j: Record<string, unknown>) => ({
          ...j,
          factory: { company_name: j.company_name, logo_url: j.logo_url },
          _distance_km: j.distance_km,
        }))

        if (search) {
          const q = search.toLowerCase()
          filtered = filtered.filter((j: Job) =>
            j.title.toLowerCase().includes(q) ||
            j.factory?.company_name?.toLowerCase().includes(q)
          )
        }
        if (industry !== 'all') {
          filtered = filtered.filter((j: Job) => j.industry === industry)
        }
        if (shiftFilter !== 'all') {
          filtered = filtered.filter((j: Job) => j.shift_type === shiftFilter)
        }

        setJobs(filtered)
      }
    } else {
      // No location, fetch all active jobs
      let query = supabase
        .from('jobs')
        .select('*, factory_profiles!jobs_factory_id_fkey(company_name, logo_url)')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(50)

      if (industry !== 'all') query = query.eq('industry', industry)
      if (shiftFilter !== 'all') query = query.eq('shift_type', shiftFilter)

      const { data } = await query

      if (data) {
        let filtered = data.map((j: Record<string, unknown>) => ({
          ...j,
          factory: (j as Record<string, unknown>).factory_profiles,
        })) as unknown as Job[]
        if (search) {
          const q = search.toLowerCase()
          filtered = filtered.filter((j) =>
            j.title.toLowerCase().includes(q)
          )
        }
        setJobs(filtered)
      }
    }

    setLoading(false)
  }, [latitude, longitude, radius, search, industry, shiftFilter, supabase])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  useEffect(() => {
    async function fetchApplied() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return
      const { data } = await supabase.from('applications').select('job_id').eq('worker_id', authUser.id)
      if (data) setAppliedJobs(new Set(data.map(a => a.job_id)))
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
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Tim viec lam</h1>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tim theo ten viec, cong ty..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Nganh nghe" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map(i => (
                  <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={shiftFilter} onValueChange={setShiftFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Ca lam" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tat ca ca</SelectItem>
                <SelectItem value="day">Ca ngay</SelectItem>
                <SelectItem value="night">Ca dem</SelectItem>
                <SelectItem value="rotating">Ca xoay</SelectItem>
                <SelectItem value="flexible">Linh hoat</SelectItem>
              </SelectContent>
            </Select>
            {latitude && longitude && (
              <Select value={String(radius)} onValueChange={(v) => setRadius(Number(v))}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 km</SelectItem>
                  <SelectItem value="5">5 km</SelectItem>
                  <SelectItem value="10">10 km</SelectItem>
                  <SelectItem value="20">20 km</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <Badge variant="secondary" className="mb-4">
          {jobs.length} viec lam
        </Badge>

        {/* Job List */}
        <div className="space-y-3 max-w-3xl">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <SlidersHorizontal className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Khong tim thay viec lam phu hop</p>
              <p className="text-sm mt-1">Thu thay doi bo loc hoac mo rong ban kinh</p>
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
    </div>
  )
}
