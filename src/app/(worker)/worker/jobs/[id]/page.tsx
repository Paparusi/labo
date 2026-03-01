'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useSavedJobs } from '@/hooks/useSavedJobs'
import Header from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft, MapPin, Banknote, Clock, Users, Building2,
  Calendar, Loader2, CheckCircle2, Globe, Bookmark,
} from 'lucide-react'
import { formatSalaryRange } from '@/lib/geo'
import type { User, Job } from '@/types'

const shiftLabels: Record<string, string> = {
  day: 'Ca ngày', night: 'Ca đêm', rotating: 'Ca xoay', flexible: 'Linh hoạt',
}
const genderLabels: Record<string, string> = {
  male: 'Nam', female: 'Nữ', other: 'Khác',
}

export default function WorkerJobDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [applied, setApplied] = useState(false)
  const [applying, setApplying] = useState(false)
  const { toggleSave, isSaved } = useSavedJobs()
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data: userData } = await supabase.from('users').select('*').eq('id', authUser.id).single()
        setUser(userData)

        // Check if already applied
        const { data: app } = await supabase
          .from('applications')
          .select('id')
          .eq('job_id', id)
          .eq('worker_id', authUser.id)
          .maybeSingle()
        if (app) setApplied(true)
      }

      const { data: jobData } = await supabase
        .from('jobs')
        .select('*, factory_profiles!jobs_factory_id_fkey(company_name, logo_url, industry, address, size, description, website)')
        .eq('id', id)
        .single()

      if (jobData) {
        setJob({
          ...jobData,
          factory: jobData.factory_profiles,
        } as unknown as Job)
      }
      setLoading(false)
    }
    fetchData()
  }, [id, supabase])

  const handleApply = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return
    setApplying(true)
    const { error } = await supabase.from('applications').insert({
      job_id: id,
      worker_id: authUser.id,
      status: 'pending',
    })
    if (!error) {
      setApplied(true)

      // Notify factory
      if (job) {
        const { data: wp } = await supabase
          .from('worker_profiles')
          .select('full_name')
          .eq('user_id', authUser.id)
          .single()
        await supabase.from('notifications').insert({
          user_id: job.factory_id,
          type: 'new_application',
          title: 'Ứng viên mới',
          message: `${wp?.full_name || 'Một công nhân'} vừa ứng tuyển vị trí "${job.title}"`,
          data: { job_id: id },
        })
      }
    }
    setApplying(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-gray-500">Không tìm thấy việc làm</p>
          <Button asChild className="mt-4"><Link href="/worker/jobs">Quay lại</Link></Button>
        </div>
      </div>
    )
  }

  const factory = job.factory

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" />Quay lại
        </Button>

        {/* Job Header */}
        <Card className="mb-4">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                {factory?.logo_url ? (
                  <img src={factory.logo_url} alt="" className="h-14 w-14 rounded-xl object-cover" />
                ) : (
                  <Building2 className="h-7 w-7 text-amber-700" />
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900">{job.title}</h1>
                <p className="text-gray-500 mt-1">{factory?.company_name || 'Nhà máy'}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                    {job.status === 'active' ? 'Đang tuyển' : job.status}
                  </Badge>
                  {job.industry && <Badge variant="outline">{job.industry}</Badge>}
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Banknote className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-gray-500">Lương</p>
                  <p className="font-medium">{formatSalaryRange(job.salary_min, job.salary_max)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-gray-500">Ca làm</p>
                  <p className="font-medium">{shiftLabels[job.shift_type] || job.shift_type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-gray-500">Số lượng</p>
                  <p className="font-medium">{job.positions} vị trí</p>
                </div>
              </div>
              {job.start_date && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Bắt đầu</p>
                    <p className="font-medium">{new Date(job.start_date).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Apply and Save Buttons */}
        <div className="mb-4 flex gap-3">
          {applied ? (
            <Button disabled className="flex-1 bg-emerald-100 text-emerald-700 cursor-default">
              <CheckCircle2 className="h-4 w-4 mr-2" />Đã ứng tuyển
            </Button>
          ) : (
            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={handleApply} disabled={applying}>
              {applying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Ứng tuyển ngay
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={() => toggleSave(id)}
            className="w-12"
            aria-label={isSaved(id) ? 'Bỏ lưu' : 'Lưu việc làm'}
          >
            <Bookmark
              className={`h-5 w-5 ${
                isSaved(id)
                  ? 'fill-emerald-600 text-emerald-600'
                  : 'text-gray-400'
              }`}
            />
          </Button>
        </div>

        {/* Job Description */}
        {job.description && (
          <Card className="mb-4">
            <CardHeader><CardTitle className="text-lg">Mô tả công việc</CardTitle></CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Skills */}
        {job.skills_required?.length > 0 && (
          <Card className="mb-4">
            <CardHeader><CardTitle className="text-lg">Kỹ năng yêu cầu</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {job.skills_required.map(skill => (
                  <Badge key={skill} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Requirements */}
        {(job.gender_requirement || job.address) && (
          <Card className="mb-4">
            <CardHeader><CardTitle className="text-lg">Yêu cầu khác</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {job.gender_requirement && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span>Giới tính:{genderLabels[job.gender_requirement] || 'Không yêu cầu'}</span>
                </div>
              )}
              {job.address && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{job.address}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Factory Info */}
        {factory && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Thông tin nhà máy</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <p className="font-semibold text-gray-900">{factory.company_name}</p>
              {factory.description && <p className="text-sm text-gray-600">{factory.description}</p>}
              {factory.address && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="h-4 w-4" />{factory.address}
                </div>
              )}
              {factory.website && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Globe className="h-4 w-4" />
                  <a href={factory.website} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                    {factory.website}
                  </a>
                </div>
              )}
              <Link href={`/factory/${job.factory_id}`} className="inline-block mt-2 text-sm text-emerald-600 hover:underline font-medium">
                Xem hồ sơ nhà máy
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
