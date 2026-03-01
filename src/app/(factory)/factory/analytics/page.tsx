'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

import Header from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, TrendingUp, Users, Briefcase, Clock, CheckCircle2, XCircle, BarChart3 } from 'lucide-react'

interface AnalyticsData {
  totalJobs: number
  activeJobs: number
  totalApplications: number
  pendingApplications: number
  acceptedApplications: number
  rejectedApplications: number
  avgApplicationsPerJob: number
  applicationsOverTime: { date: string; count: number }[]
  jobPerformance: { title: string; applications: number; status: string }[]
  topSkills: { skill: string; count: number }[]
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')
  const supabase = createClient()

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const daysAgo = new Date()
      daysAgo.setDate(daysAgo.getDate() - Number(period))
      const sinceDate = daysAgo.toISOString()

      const [jobsResult, appsResult, recentAppsResult] = await Promise.all([
        supabase
          .from('jobs')
          .select('id, title, status, skills_required, created_at')
          .eq('factory_id', user.id),
        supabase
          .from('applications')
          .select('id, status, applied_at, job_id, jobs!inner(factory_id)')
          .eq('jobs.factory_id', user.id),
        supabase
          .from('applications')
          .select('id, applied_at, jobs!inner(factory_id)')
          .eq('jobs.factory_id', user.id)
          .gte('applied_at', sinceDate)
          .order('applied_at', { ascending: true }),
      ])

      const jobs = jobsResult.data || []
      const apps = appsResult.data || []
      const recentApps = recentAppsResult.data || []

      // Applications over time (group by date)
      const dateMap = new Map<string, number>()
      recentApps.forEach(app => {
        const date = new Date(app.applied_at).toLocaleDateString('vi-VN')
        dateMap.set(date, (dateMap.get(date) || 0) + 1)
      })
      const applicationsOverTime = Array.from(dateMap.entries()).map(([date, count]) => ({ date, count }))

      // Job performance
      const jobAppCount = new Map<string, number>()
      apps.forEach(app => {
        jobAppCount.set(app.job_id, (jobAppCount.get(app.job_id) || 0) + 1)
      })
      const jobPerformance = jobs
        .map(j => ({
          title: j.title,
          applications: jobAppCount.get(j.id) || 0,
          status: j.status,
        }))
        .sort((a, b) => b.applications - a.applications)
        .slice(0, 10)

      // Top skills
      const skillCount = new Map<string, number>()
      jobs.forEach(j => {
        if (j.skills_required) {
          j.skills_required.forEach((s: string) => {
            skillCount.set(s, (skillCount.get(s) || 0) + 1)
          })
        }
      })
      const topSkills = Array.from(skillCount.entries())
        .map(([skill, count]) => ({ skill, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8)

      const pending = apps.filter(a => a.status === 'pending').length
      const accepted = apps.filter(a => a.status === 'accepted').length
      const rejected = apps.filter(a => a.status === 'rejected').length

      setData({
        totalJobs: jobs.length,
        activeJobs: jobs.filter(j => j.status === 'active').length,
        totalApplications: apps.length,
        pendingApplications: pending,
        acceptedApplications: accepted,
        rejectedApplications: rejected,
        avgApplicationsPerJob: jobs.length > 0 ? Math.round(apps.length / jobs.length * 10) / 10 : 0,
        applicationsOverTime,
        jobPerformance,
        topSkills,
      })

      setLoading(false)
    }
    fetchAnalytics()
  }, [supabase, period])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-6 animate-fade-in-up">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Phân tích tuyển dụng</h1>
            <p className="text-sm text-gray-500 mt-1">Thống kê hiệu quả tuyển dụng của bạn</p>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 ngày qua</SelectItem>
              <SelectItem value="30">30 ngày qua</SelectItem>
              <SelectItem value="90">90 ngày qua</SelectItem>
              <SelectItem value="365">1 năm qua</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          </div>
        ) : data && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Tổng tin tuyển', value: data.totalJobs, icon: Briefcase, color: 'text-blue-600 bg-blue-100' },
                { label: 'Tổng đơn ứng tuyển', value: data.totalApplications, icon: Users, color: 'text-emerald-600 bg-emerald-100' },
                { label: 'TB đơn/tin', value: data.avgApplicationsPerJob, icon: TrendingUp, color: 'text-purple-600 bg-purple-100' },
                { label: 'Tỉ lệ chấp nhận', value: data.totalApplications > 0 ? `${Math.round(data.acceptedApplications / data.totalApplications * 100)}%` : '0%', icon: CheckCircle2, color: 'text-green-600 bg-green-100' },
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

            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              {/* Application Status Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-emerald-600" />
                    Trạng thái đơn ứng tuyển
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: 'Đang chờ', count: data.pendingApplications, color: 'bg-amber-500', icon: Clock },
                      { label: 'Đã chấp nhận', count: data.acceptedApplications, color: 'bg-green-500', icon: CheckCircle2 },
                      { label: 'Đã từ chối', count: data.rejectedApplications, color: 'bg-red-500', icon: XCircle },
                    ].map(item => {
                      const pct = data.totalApplications > 0 ? (item.count / data.totalApplications * 100) : 0
                      return (
                        <div key={item.label}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <item.icon className="h-4 w-4" />
                              {item.label}
                            </span>
                            <span className="text-sm text-gray-500">{item.count} ({Math.round(pct)}%)</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full ${item.color} transition-all duration-500`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Applications Over Time */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    Đơn ứng tuyển theo thời gian
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.applicationsOverTime.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-8">Chưa có dữ liệu trong khoảng thời gian này</p>
                  ) : (
                    <div className="space-y-2">
                      {data.applicationsOverTime.slice(-10).map(item => {
                        const maxCount = Math.max(...data.applicationsOverTime.map(a => a.count))
                        const pct = maxCount > 0 ? (item.count / maxCount * 100) : 0
                        return (
                          <div key={item.date} className="flex items-center gap-3">
                            <span className="text-xs text-gray-500 w-20 shrink-0 text-right">{item.date}</span>
                            <div className="flex-1 bg-gray-100 rounded-full h-5 relative">
                              <div
                                className="h-5 rounded-full bg-emerald-500 transition-all duration-500 flex items-center justify-end pr-2"
                                style={{ width: `${Math.max(pct, 8)}%` }}
                              >
                                <span className="text-[10px] text-white font-medium">{item.count}</span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Job Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-emerald-600" />
                    Hiệu quả tin tuyển
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.jobPerformance.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-8">Chưa có tin tuyển dụng nào</p>
                  ) : (
                    <div className="space-y-3">
                      {data.jobPerformance.map((job, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{job.title}</p>
                            <p className="text-xs text-gray-500">
                              {job.status === 'active' ? 'Đang tuyển' : job.status === 'closed' ? 'Đã đóng' : 'Bản nháp'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-sm font-semibold text-gray-700">{job.applications}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top Skills */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-emerald-600" />
                    Kỹ năng tuyển nhiều nhất
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.topSkills.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-8">Chưa có dữ liệu</p>
                  ) : (
                    <div className="space-y-3">
                      {data.topSkills.map(item => {
                        const maxCount = Math.max(...data.topSkills.map(s => s.count))
                        const pct = maxCount > 0 ? (item.count / maxCount * 100) : 0
                        return (
                          <div key={item.skill}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-700">{item.skill}</span>
                              <span className="text-xs text-gray-500">{item.count} tin</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-emerald-500 transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
