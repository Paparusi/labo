'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import StarRating from '@/components/shared/StarRating'
import ReviewList from '@/components/shared/ReviewList'
import { formatSalaryRange } from '@/lib/geo'
import type { User, FactoryProfile, Job } from '@/types'
import {
  Building2, MapPin, Globe, Phone, User as UserIcon,
  Briefcase, Users, Banknote, Loader2, ArrowLeft,
} from 'lucide-react'

const INDUSTRY_LABELS: Record<string, string> = {
  electronics: 'Điện tử', garment: 'May mặc', footwear: 'Giày dép',
  food: 'Thực phẩm', furniture: 'Nội thất', mechanical: 'Cơ khí',
  packaging: 'Đóng gói', plastics: 'Nhựa',
}

const SIZE_LABELS: Record<string, string> = {
  small: 'Nhỏ (<50 CN)', medium: 'Vừa (50-200 CN)', large: 'Lớn (>200 CN)',
}

const SHIFT_LABELS: Record<string, string> = {
  day: 'Ca ngày', night: 'Ca đêm', rotating: 'Ca xoay', flexible: 'Linh hoạt',
}

export default function FactoryProfilePage() {
  const params = useParams()
  const id = params.id as string

  const [user, setUser] = useState<User | null>(null)
  const [factory, setFactory] = useState<FactoryProfile | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [avgRating, setAvgRating] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setNotFound(false)

      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single()
          if (userData) setUser(userData)
        }

        const { data: factoryData, error: factoryError } = await supabase
          .from('factory_profiles')
          .select('*')
          .eq('user_id', id)
          .single()

        if (factoryError || !factoryData) {
          setNotFound(true)
          setLoading(false)
          return
        }

        setFactory(factoryData)

        const [jobsResult, ratingResult] = await Promise.all([
          supabase
            .from('jobs')
            .select('*')
            .eq('factory_id', id)
            .eq('status', 'active')
            .order('created_at', { ascending: false }),
          supabase.rpc('get_user_avg_rating', { p_user_id: id }),
        ])

        if (jobsResult.data) setJobs(jobsResult.data)
        if (ratingResult.data !== null && ratingResult.data !== undefined) {
          setAvgRating(Number(ratingResult.data) || 0)
        }
      } catch (err) {
        console.error('Error fetching factory profile:', err)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchData()
  }, [id, supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </div>
    )
  }

  if (notFound || !factory) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} />
        <div className="container mx-auto max-w-3xl px-4 py-16 text-center">
          <Building2 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy nhà máy</h1>
          <p className="text-gray-500 mb-6">Nhà máy này không tồn tại hoặc đã bị xóa.</p>
          <Button asChild variant="outline">
            <Link href="/"><ArrowLeft className="h-4 w-4 mr-2" />Quay lại</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <main className="container mx-auto max-w-3xl px-4 py-6 space-y-6">
        <Button variant="ghost" size="sm" asChild className="text-gray-600 hover:text-emerald-600 -ml-2">
          <Link href="/"><ArrowLeft className="h-4 w-4 mr-1" />Quay lại</Link>
        </Button>

        {/* Factory Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="shrink-0">
                {factory.logo_url ? (
                  <img src={factory.logo_url} alt={factory.company_name} className="h-16 w-16 rounded-lg object-cover border" />
                ) : (
                  <div className="h-16 w-16 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-emerald-600" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-900 mb-2">{factory.company_name}</h1>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {factory.industry && (
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
                      {INDUSTRY_LABELS[factory.industry] || factory.industry}
                    </Badge>
                  )}
                  {factory.size && (
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                      <Users className="h-3 w-3 mr-1" />{SIZE_LABELS[factory.size] || factory.size}
                    </Badge>
                  )}
                </div>
                {factory.address && (
                  <div className="flex items-start gap-1.5 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-gray-400" />
                    <span>{factory.address}</span>
                  </div>
                )}
                {avgRating > 0 && (
                  <div className="mt-3">
                    <StarRating rating={avgRating} showValue />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        {factory.description && (
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Mô tả</CardTitle></CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{factory.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Contact */}
        {(factory.contact_person || factory.contact_phone || factory.website) && (
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Liên hệ</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-3">
              {factory.contact_person && (
                <div className="flex items-center gap-2 text-sm">
                  <UserIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-500">Người liên hệ:</span>
                  <span className="text-gray-900 font-medium">{factory.contact_person}</span>
                </div>
              )}
              {factory.contact_phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-500">Số điện thoại:</span>
                  <a href={`tel:${factory.contact_phone}`} className="text-emerald-600 font-medium hover:underline">
                    {factory.contact_phone}
                  </a>
                </div>
              )}
              {factory.website && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <a href={factory.website.startsWith('http') ? factory.website : `https://${factory.website}`}
                    target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-medium hover:underline truncate">
                    {factory.website}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Open Jobs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-emerald-600" />
              Việc làm đang tuyển
              {jobs.length > 0 && (
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 ml-1">{jobs.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {jobs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Briefcase className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Chưa có việc làm nào đang tuyển</p>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map(job => (
                  <Link key={job.id} href={`/worker/jobs/${job.id}`} className="block">
                    <div className="border rounded-lg p-4 hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors">
                      <h3 className="font-medium text-gray-900 mb-2">{job.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Banknote className="h-4 w-4 text-gray-400" />
                          <span>{formatSalaryRange(job.salary_min, job.salary_max)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span>{job.positions} vị trí</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {SHIFT_LABELS[job.shift_type] || job.shift_type}
                        </Badge>
                      </div>
                      <span className="text-sm text-emerald-600 font-medium mt-3 inline-block">Xem chi tiết</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reviews */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Đánh giá</CardTitle></CardHeader>
          <CardContent className="pt-0">
            <ReviewList userId={id} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
