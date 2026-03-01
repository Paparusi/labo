'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

import Header from '@/components/layout/Header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Building2, MapPin, Banknote, Clock, Loader2, Star, GitBranch } from 'lucide-react'
import { toast } from 'sonner'
import ReviewForm from '@/components/shared/ReviewForm'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { formatSalaryRange } from '@/lib/geo'
import type { Application, ApplicationStage } from '@/types'

const STAGE_LABELS: Record<ApplicationStage, string> = {
  applied: 'Đã ứng tuyển',
  screening: 'Sàng lọc',
  interview: 'Phỏng vấn',
  offer: 'Đề nghị',
  hired: 'Đã tuyển',
  rejected: 'Từ chối',
}

const STAGE_ORDER: ApplicationStage[] = ['applied', 'screening', 'interview', 'offer', 'hired']

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-700' },
  accepted: { label: 'Đã chấp nhận', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Từ chối', color: 'bg-red-100 text-red-700' },
  withdrawn: { label: 'Đã rút', color: 'bg-gray-100 text-gray-700' },
}

export default function WorkerApplicationsPage() {

  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewingFactory, setReviewingFactory] = useState<string | null>(null)
  const [withdrawId, setWithdrawId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      const { data } = await supabase
        .from('applications')
        .select('*, stage, jobs(*, factory_profiles!jobs_factory_profile_fkey(company_name, logo_url, address))')
        .eq('worker_id', authUser.id)
        .order('applied_at', { ascending: false })

      if (data) {
        setApplications(data.map((a: Record<string, unknown>) => ({
          ...a,
          job: {
            ...(a.jobs as Record<string, unknown>),
            factory: (a.jobs as Record<string, unknown>)?.factory_profiles,
          },
        })) as unknown as Application[])
      }
      setLoading(false)
    }
    fetchData()
  }, [supabase])

  const handleWithdraw = async () => {
    if (!withdrawId) return
    const { error } = await supabase.from('applications').update({ status: 'withdrawn' }).eq('id', withdrawId)
    if (error) {
      toast.error('Không thể rút đơn ứng tuyển')
      return
    }
    setApplications(prev => prev.map(a => a.id === withdrawId ? { ...a, status: 'withdrawn' } : a))
    setWithdrawId(null)
    toast.success('Đã rút đơn ứng tuyển')
  }

  const filterByStatus = (status: string) => {
    if (status === 'all') return applications
    return applications.filter(a => a.status === status)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Đơn ứng tuyển của tôi</h1>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          </div>
        ) : (
          <>
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">Tất cả ({applications.length})</TabsTrigger>
                <TabsTrigger value="pending">Chờ xử lý ({filterByStatus('pending').length})</TabsTrigger>
                <TabsTrigger value="accepted">Chấp nhận ({filterByStatus('accepted').length})</TabsTrigger>
                <TabsTrigger value="rejected">Từ chối ({filterByStatus('rejected').length})</TabsTrigger>
              </TabsList>

              {['all', 'pending', 'accepted', 'rejected'].map(tab => (
                <TabsContent key={tab} value={tab} className="space-y-3">
                  {filterByStatus(tab).length === 0 ? (
                    <div className="text-center py-12 text-gray-500">Không có đơn ứng tuyển nào</div>
                  ) : (
                    filterByStatus(tab).map(app => (
                      <Card key={app.id} className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                                  <Building2 className="h-4 w-4 text-amber-700" />
                                </div>
                                <span className="text-sm text-gray-500">
                                  {app.job?.factory?.company_name || 'Nhà máy'}
                                </span>
                              </div>
                              <h3 className="font-semibold text-gray-900">{app.job?.title}</h3>
                              <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                                {app.job?.address && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5" />{app.job.address}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Banknote className="h-3.5 w-3.5" />
                                  {formatSalaryRange(app.job?.salary_min ?? null, app.job?.salary_max ?? null)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {new Date(app.applied_at).toLocaleDateString('vi-VN')}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge className={STATUS_CONFIG[app.status]?.color}>
                                {STATUS_CONFIG[app.status]?.label}
                              </Badge>
                              {(() => {
                                const stage = (app as unknown as Record<string, unknown>).stage as ApplicationStage | undefined
                                return stage && stage !== 'applied' && stage !== 'rejected' ? (
                                  <span className="text-xs text-emerald-600 flex items-center gap-1">
                                    <GitBranch className="h-3 w-3" />
                                    {STAGE_LABELS[stage]}
                                  </span>
                                ) : null
                              })()}
                              {app.status === 'pending' && (
                                <Button variant="ghost" size="sm" className="text-red-600" onClick={() => setWithdrawId(app.id)}>
                                  Rút đơn
                                </Button>
                              )}
                              {app.status === 'accepted' && app.job?.factory_id && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-amber-600"
                                  onClick={() => setReviewingFactory(app.job!.factory_id)}
                                >
                                  <Star className="h-3.5 w-3.5 mr-1" />Đánh giá
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>
              ))}
            </Tabs>

            <ConfirmDialog
              open={!!withdrawId}
              onOpenChange={(open) => { if (!open) setWithdrawId(null) }}
              title="Rút đơn ứng tuyển"
              description="Bạn có chắc muốn rút đơn ứng tuyển này? Hành động này không thể hoàn tác."
              confirmLabel="Rút đơn"
              variant="destructive"
              onConfirm={handleWithdraw}
            />

            {reviewingFactory && (
              <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                <h3 className="font-semibold mb-3">Đánh giá nhà máy</h3>
                <ReviewForm
                  toUserId={reviewingFactory}
                  onSubmitted={() => setReviewingFactory(null)}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
