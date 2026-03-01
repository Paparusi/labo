'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Users, MapPin, Banknote, Clock, CheckCircle2, XCircle, Loader2, User, MessageSquare, Star } from 'lucide-react'
import { formatSalaryRange } from '@/lib/geo'
import type { User as UserType, Application, WorkerProfile } from '@/types'
import ReviewForm from '@/components/shared/ReviewForm'
import StarRating from '@/components/shared/StarRating'

export default function JobDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [user, setUser] = useState<UserType | null>(null)
  const [job, setJob] = useState<Record<string, unknown> | null>(null)
  const [applications, setApplications] = useState<(Application & { worker?: WorkerProfile })[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewingWorker, setReviewingWorker] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      const { data: userData } = await supabase.from('users').select('*').eq('id', authUser.id).single()
      setUser(userData)

      const { data: jobData } = await supabase.from('jobs').select('*').eq('id', id).single()
      setJob(jobData)

      const { data: appData } = await supabase
        .from('applications')
        .select('*, worker_profiles!applications_worker_id_fkey(*)')
        .eq('job_id', id)
        .order('applied_at', { ascending: false })

      if (appData) {
        setApplications(appData.map((a: Record<string, unknown>) => ({
          ...a,
          worker: a.worker_profiles,
        } as Application & { worker?: WorkerProfile })))
      }
      setLoading(false)
    }
    fetchData()
  }, [id, supabase])

  const updateApplicationStatus = async (appId: string, status: 'accepted' | 'rejected') => {
    await supabase.from('applications').update({ status }).eq('id', appId)
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a))

    // Notify worker
    const app = applications.find(a => a.id === appId)
    if (app) {
      await supabase.from('notifications').insert({
        user_id: app.worker_id,
        type: status === 'accepted' ? 'application_accepted' : 'application_rejected',
        title: status === 'accepted' ? 'Chúc mừng! Đơn ứng tuyển đã được chấp nhận' : 'Đơn ứng tuyển không được chấp nhận',
        message: `Đơn ứng tuyển vị trí "${(job as Record<string, unknown>)?.title}" đã ${status === 'accepted' ? 'được chấp nhận' : 'bị từ chối'}`,
        data: { job_id: id, application_id: appId },
      })

      // Send email to worker
      const { data: workerUser } = await supabase
        .from('users')
        .select('email')
        .eq('id', app.worker_id)
        .single()
      const { data: factoryProfile } = await supabase
        .from('factory_profiles')
        .select('company_name')
        .eq('user_id', user!.id)
        .single()
      if (workerUser?.email) {
        fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'application_status',
            data: {
              workerEmail: workerUser.email,
              workerName: app.worker?.full_name || 'Công nhân',
              jobTitle: (job as Record<string, unknown>)?.title || '',
              factoryName: factoryProfile?.company_name || 'Nhà máy',
              status,
            },
          }),
        }).catch(() => {})
      }
    }
  }

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} />
        <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} />
        <div className="container mx-auto px-4 py-6 text-center">
          <p>Không tìm thấy tin tuyển dụng</p>
        </div>
      </div>
    )
  }

  const pending = applications.filter(a => a.status === 'pending')
  const accepted = applications.filter(a => a.status === 'accepted')
  const rejected = applications.filter(a => a.status === 'rejected')

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/factory/jobs"><ArrowLeft className="h-4 w-4 mr-2" />Quay lại</Link>
        </Button>

        {/* Job Info */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{job.title as string}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
              <span className="flex items-center gap-1"><Banknote className="h-4 w-4" />{formatSalaryRange(job.salary_min as number, job.salary_max as number)}</span>
              <span className="flex items-center gap-1"><Users className="h-4 w-4" />{String(job.positions)} vị trí</span>
              {job.address ? <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{String(job.address)}</span> : null}
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{new Date(job.created_at as string).toLocaleDateString('vi-VN')}</span>
            </div>
            {job.description ? <p className="text-gray-600 whitespace-pre-wrap">{String(job.description)}</p> : null}
          </CardContent>
        </Card>

        {/* Applications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Ứng viên ({applications.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 mb-6">
              <Badge className="bg-yellow-100 text-yellow-700">Chờ xử lý: {pending.length}</Badge>
              <Badge className="bg-green-100 text-green-700">Chấp nhận: {accepted.length}</Badge>
              <Badge className="bg-red-100 text-red-700">Từ chối: {rejected.length}</Badge>
            </div>

            {applications.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Chưa có ứng viên nào</p>
            ) : (
              <div className="space-y-3">
                {applications.map(app => (
                  <div key={app.id} className="flex items-center justify-between p-4 rounded-lg border bg-white">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <Link href={`/worker/${app.worker_id}`} className="font-medium hover:text-emerald-600">
                          {app.worker?.full_name || 'Ứng viên'}
                        </Link>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          {app.worker?.experience_years !== undefined && (
                            <span>{app.worker.experience_years} năm KN</span>
                          )}
                          {app.worker?.skills && app.worker.skills.length > 0 && (
                            <span>- {app.worker.skills.slice(0, 3).join(', ')}</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(app.applied_at).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMessage(app.worker_id)}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />Nhắn tin
                      </Button>
                      {app.status === 'pending' ? (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => updateApplicationStatus(app.id, 'accepted')}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />Nhận
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => updateApplicationStatus(app.id, 'rejected')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />Từ chối
                          </Button>
                        </>
                      ) : (
                        <>
                          {app.status === 'accepted' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-amber-600 border-amber-200 hover:bg-amber-50"
                              onClick={() => setReviewingWorker(app.worker_id)}
                            >
                              <Star className="h-4 w-4 mr-1" />Đánh giá
                            </Button>
                          )}
                          <Badge className={
                            app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                            app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }>
                            {app.status === 'accepted' ? 'Đã chấp nhận' : 'Đã từ chối'}
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {reviewingWorker && (
              <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                <h3 className="font-semibold mb-3">Đánh giá công nhân</h3>
                <ReviewForm
                  toUserId={reviewingWorker}
                  jobId={id as string}
                  onSubmitted={() => setReviewingWorker(null)}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
