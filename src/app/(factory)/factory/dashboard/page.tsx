'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'
import Header from '@/components/layout/Header'
import { DashboardSkeleton } from '@/components/shared/PageSkeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ProfileCompleteness from '@/components/shared/ProfileCompleteness'
import {
  Briefcase, Users, FileText, TrendingUp, Plus,
  Clock, CheckCircle2, XCircle, AlertTriangle,
} from 'lucide-react'
import { isSubscriptionActive, getTrialDaysLeft } from '@/lib/subscription'
import type { Subscription, SubscriptionPlan, FactoryProfile } from '@/types'

export default function FactoryDashboard() {
  const { user } = useUser()
  const [factoryProfile, setFactoryProfile] = useState<FactoryProfile | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null)
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
  })
  const [recentApplications, setRecentApplications] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      // Parallelize all independent queries
      const [fpResult, subResult, jobCountResult, appResult, recentResult] = await Promise.all([
        supabase.from('factory_profiles').select('*').eq('user_id', authUser.id).single(),
        supabase.from('subscriptions').select('*, subscription_plans(*)').eq('factory_id', authUser.id).order('created_at', { ascending: false }).limit(1).single(),
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('factory_id', authUser.id).eq('status', 'active'),
        supabase.from('applications').select('status, jobs!inner(factory_id)').eq('jobs.factory_id', authUser.id),
        supabase.from('applications').select('*, jobs!inner(title, factory_id), worker_profiles!applications_worker_id_fkey(full_name, skills)').eq('jobs.factory_id', authUser.id).order('applied_at', { ascending: false }).limit(5),
      ])

      if (fpResult.data) setFactoryProfile(fpResult.data)
      if (subResult.data) {
        setSubscription(subResult.data)
        setPlan(subResult.data.subscription_plans)
      }

      const appData = appResult.data
      const pending = appData?.filter(a => a.status === 'pending').length || 0
      const accepted = appData?.filter(a => a.status === 'accepted').length || 0
      const rejected = appData?.filter(a => a.status === 'rejected').length || 0

      setStats({
        activeJobs: jobCountResult.count || 0,
        totalApplications: appData?.length || 0,
        pendingApplications: pending,
        acceptedApplications: accepted,
        rejectedApplications: rejected,
      })

      if (recentResult.data) setRecentApplications(recentResult.data)
      setLoading(false)
    }
    fetchData()
  }, [supabase])

  const trialDays = getTrialDaysLeft(subscription)
  const isActive = isSubscriptionActive(subscription)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} />
        <DashboardSkeleton />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <div className="container mx-auto px-4 py-6">
        {/* Trial/Subscription Banner */}
        {subscription?.status === 'trial' && trialDays > 0 && (
          <div className="mb-6 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-900">Gói dùng thử - Còn {trialDays} ngày</p>
                <p className="text-sm text-amber-700">Nâng cấp để mở rộng tính năng tuyển dụng</p>
              </div>
            </div>
            <Button asChild className="bg-amber-600 hover:bg-amber-700">
              <Link href="/factory/subscription">Nâng cấp</Link>
            </Button>
          </div>
        )}
        {!isActive && subscription?.status !== 'trial' && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-900">Gói dịch vụ đã hết hạn</p>
                <p className="text-sm text-red-700">Gia hạn để tiếp tục sử dụng các tính năng</p>
              </div>
            </div>
            <Button asChild className="bg-red-600 hover:bg-red-700">
              <Link href="/factory/subscription">Gia hạn ngay</Link>
            </Button>
          </div>
        )}

        {/* Profile Completeness */}
        <div className="mb-6">
          <ProfileCompleteness role="factory" factoryProfile={factoryProfile} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Bảng điều khiển</h1>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/factory/jobs/new"><Plus className="h-4 w-4 mr-2" />Đăng tin tuyển</Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Tin tuyển đang hoạt động', value: stats.activeJobs, icon: Briefcase, color: 'text-blue-600 bg-blue-100' },
            { label: 'Tổng đơn ứng tuyển', value: stats.totalApplications, icon: FileText, color: 'text-emerald-600 bg-emerald-100' },
            { label: 'Đang chờ xử lý', value: stats.pendingApplications, icon: Clock, color: 'text-amber-600 bg-amber-100' },
            { label: 'Đã chấp nhận', value: stats.acceptedApplications, icon: CheckCircle2, color: 'text-green-600 bg-green-100' },
          ].map(stat => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Applications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Ứng viên mới nhất</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/factory/jobs">Xem tất cả</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentApplications.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Chưa có ứng viên nào</p>
              ) : (
                <div className="space-y-3">
                  {recentApplications.map((app: Record<string, unknown>) => (
                    <div key={app.id as string} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div>
                        <p className="font-medium text-sm">
                          {(app.worker_profiles as Record<string, unknown>)?.full_name as string || 'Ứng viên'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Ứng tuyển: {(app.jobs as Record<string, unknown>)?.title as string}
                        </p>
                      </div>
                      <Badge className={
                        app.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }>
                        {app.status === 'pending' ? 'Chờ' : app.status === 'accepted' ? 'Đã nhận' : String(app.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hành động nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/factory/jobs/new">
                  <Plus className="h-4 w-4 mr-3" />Đăng tin tuyển dụng mới
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/factory/workers">
                  <Users className="h-4 w-4 mr-3" />Tìm công nhân gần nhà máy
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/factory/jobs">
                  <Briefcase className="h-4 w-4 mr-3" />Quản lý tin tuyển dụng
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/factory/subscription">
                  <TrendingUp className="h-4 w-4 mr-3" />Quản lý gói dịch vụ
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
