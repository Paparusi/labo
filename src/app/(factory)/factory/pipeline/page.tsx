'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

import Header from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, User, ChevronRight, Star, MessageSquare, FileText } from 'lucide-react'
import { toast } from 'sonner'
import type { ApplicationStage } from '@/types'

const STAGES: { key: ApplicationStage; label: string; color: string }[] = [
  { key: 'applied', label: 'Đã ứng tuyển', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { key: 'screening', label: 'Sàng lọc', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { key: 'interview', label: 'Phỏng vấn', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { key: 'offer', label: 'Đề nghị', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { key: 'hired', label: 'Đã tuyển', color: 'bg-green-100 text-green-700 border-green-200' },
  { key: 'rejected', label: 'Từ chối', color: 'bg-red-100 text-red-700 border-red-200' },
]

interface PipelineApp {
  id: string
  stage: ApplicationStage
  status: string
  is_shortlisted: boolean
  is_favorite: boolean
  applied_at: string
  worker_id: string
  job_id: string
  worker_profiles: {
    full_name: string
    skills: string[]
    avatar_url: string | null
    experience_years: number
  } | null
  jobs: {
    title: string
  } | null
}

export default function PipelinePage() {
  const [applications, setApplications] = useState<PipelineApp[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<string>('all')
  const [jobs, setJobs] = useState<{ id: string; title: string }[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [appsResult, jobsResult] = await Promise.all([
        supabase
          .from('applications')
          .select('id, stage, status, is_shortlisted, is_favorite, applied_at, worker_id, job_id, worker_profiles!applications_worker_profile_fkey(full_name, skills, avatar_url, experience_years), jobs!inner(title, factory_id)')
          .eq('jobs.factory_id', user.id)
          .order('applied_at', { ascending: false }),
        supabase
          .from('jobs')
          .select('id, title')
          .eq('factory_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false }),
      ])

      if (appsResult.data) setApplications(appsResult.data as unknown as PipelineApp[])
      if (jobsResult.data) setJobs(jobsResult.data)
      setLoading(false)
    }
    fetchData()
  }, [supabase])

  const moveStage = async (appId: string, newStage: ApplicationStage) => {
    const app = applications.find(a => a.id === appId)
    if (!app || app.stage === newStage) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const oldStage = app.stage

    // Update application stage
    const { error } = await supabase
      .from('applications')
      .update({ stage: newStage })
      .eq('id', appId)

    if (error) {
      toast.error('Không thể cập nhật giai đoạn')
      return
    }

    // Record history
    await supabase.from('application_stage_history').insert({
      application_id: appId,
      from_stage: oldStage,
      to_stage: newStage,
      changed_by: user.id,
    })

    // If stage is 'hired', update status to 'accepted'
    if (newStage === 'hired') {
      await supabase.from('applications').update({ status: 'accepted' }).eq('id', appId)
    }
    // If stage is 'rejected', update status to 'rejected'
    if (newStage === 'rejected') {
      await supabase.from('applications').update({ status: 'rejected' }).eq('id', appId)
    }

    // Send notification to worker
    await supabase.from('notifications').insert({
      user_id: app.worker_id,
      type: 'stage_update',
      title: 'Cập nhật hồ sơ ứng tuyển',
      message: `Đơn ứng tuyển "${app.jobs?.title}" đã chuyển sang giai đoạn: ${STAGES.find(s => s.key === newStage)?.label}`,
      data: { application_id: appId, stage: newStage },
    })

    setApplications(prev => prev.map(a => a.id === appId ? { ...a, stage: newStage } : a))
    toast.success(`Đã chuyển sang "${STAGES.find(s => s.key === newStage)?.label}"`)
  }

  const toggleFavorite = async (appId: string) => {
    const app = applications.find(a => a.id === appId)
    if (!app) return

    const { error } = await supabase
      .from('applications')
      .update({ is_favorite: !app.is_favorite })
      .eq('id', appId)

    if (!error) {
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, is_favorite: !a.is_favorite } : a))
    }
  }

  const toggleShortlist = async (appId: string) => {
    const app = applications.find(a => a.id === appId)
    if (!app) return

    const { error } = await supabase
      .from('applications')
      .update({ is_shortlisted: !app.is_shortlisted })
      .eq('id', appId)

    if (!error) {
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, is_shortlisted: !a.is_shortlisted } : a))
    }
  }

  const filteredApps = selectedJob === 'all'
    ? applications
    : applications.filter(a => a.job_id === selectedJob)

  const getStageApps = (stage: ApplicationStage) =>
    filteredApps.filter(a => a.stage === stage)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-6 animate-fade-in-up">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quy trình tuyển dụng</h1>
            <p className="text-sm text-gray-500 mt-1">Theo dõi và quản lý ứng viên qua từng giai đoạn</p>
          </div>
          <Select value={selectedJob} onValueChange={setSelectedJob}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Lọc theo tin tuyển" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả tin tuyển</SelectItem>
              {jobs.map(j => (
                <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {STAGES.filter(s => s.key !== 'rejected').map(stage => (
              <Card key={stage.key} className="min-h-[200px]">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${stage.color.split(' ')[0]}`} />
                      {stage.label}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {getStageApps(stage.key).length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {getStageApps(stage.key).length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">Chưa có ứng viên</p>
                  ) : (
                    getStageApps(stage.key).map(app => (
                      <div
                        key={app.id}
                        className="p-3 rounded-lg bg-white border hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-4 w-4 text-gray-500" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {app.worker_profiles?.full_name || 'Ứng viên'}
                              </p>
                              <p className="text-xs text-gray-500 truncate max-w-[140px]">
                                {app.jobs?.title}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => toggleFavorite(app.id)}
                              className={`p-1 rounded ${app.is_favorite ? 'text-amber-500' : 'text-gray-300 hover:text-amber-400'}`}
                            >
                              <Star className="h-3.5 w-3.5" fill={app.is_favorite ? 'currentColor' : 'none'} />
                            </button>
                          </div>
                        </div>

                        {app.worker_profiles?.skills && app.worker_profiles.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {app.worker_profiles.skills.slice(0, 2).map(s => (
                              <span key={s} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                {s}
                              </span>
                            ))}
                            {app.worker_profiles.skills.length > 2 && (
                              <span className="text-[10px] text-gray-400">+{app.worker_profiles.skills.length - 2}</span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 mt-2">
                          <Select
                            value={app.stage}
                            onValueChange={(v) => moveStage(app.id, v as ApplicationStage)}
                          >
                            <SelectTrigger className="h-7 text-xs flex-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STAGES.map(s => (
                                <SelectItem key={s.key} value={s.key} className="text-xs">
                                  {s.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" asChild>
                            <Link href={`/worker/${app.worker_id}`}>
                              <FileText className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" asChild>
                            <Link href={`/factory/messages?user=${app.worker_id}`}>
                              <MessageSquare className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Rejected column */}
            <Card className="min-h-[200px] border-red-200 bg-red-50/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-100" />
                    Từ chối
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {getStageApps('rejected').length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {getStageApps('rejected').length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">Chưa có ứng viên bị từ chối</p>
                ) : (
                  getStageApps('rejected').map(app => (
                    <div key={app.id} className="p-3 rounded-lg bg-white border border-red-100">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-3.5 w-3.5 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {app.worker_profiles?.full_name || 'Ứng viên'}
                          </p>
                          <p className="text-xs text-gray-500 truncate max-w-[160px]">
                            {app.jobs?.title}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
