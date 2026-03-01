'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminSidebar from '@/components/layout/AdminSidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Users, HardHat, Building2, Briefcase,
  CheckCircle2, FileText, MessageSquare, CreditCard, Loader2,
} from 'lucide-react'
import type { User, Job } from '@/types'

interface DashboardStats {
  totalUsers: number
  totalWorkers: number
  totalFactories: number
  totalJobs: number
  activeJobs: number
  totalApplications: number
  totalConversations: number
  activeSubscriptions: number
}

interface JobWithFactory extends Job {
  factory_profiles: { company_name: string } | null
}

const INITIAL_STATS: DashboardStats = {
  totalUsers: 0,
  totalWorkers: 0,
  totalFactories: 0,
  totalJobs: 0,
  activeJobs: 0,
  totalApplications: 0,
  totalConversations: 0,
  activeSubscriptions: 0,
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function getRoleBadge(role: string): React.ReactNode {
  switch (role) {
    case 'worker':
      return <Badge className="bg-blue-100 text-blue-700">Công nhân</Badge>
    case 'factory':
      return <Badge className="bg-purple-100 text-purple-700">Nhà máy</Badge>
    case 'admin':
      return <Badge className="bg-red-100 text-red-700">Quản trị</Badge>
    default:
      return <Badge className="bg-gray-100 text-gray-700">{role}</Badge>
  }
}

function getStatusBadge(isActive: boolean): React.ReactNode {
  if (isActive) {
    return <Badge className="bg-green-100 text-green-700">Hoạt động</Badge>
  }
  return <Badge className="bg-gray-100 text-gray-500">Vô hiệu</Badge>
}

function getJobStatusBadge(status: string): React.ReactNode {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-100 text-green-700">Đang tuyển</Badge>
    case 'closed':
      return <Badge className="bg-gray-100 text-gray-500">Đã đóng</Badge>
    case 'draft':
      return <Badge className="bg-yellow-100 text-yellow-700">Bản nháp</Badge>
    default:
      return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>(INITIAL_STATS)
  const [recentUsers, setRecentUsers] = useState<User[]>([])
  const [recentJobs, setRecentJobs] = useState<JobWithFactory[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchDashboardData() {
      // Fetch all stats in parallel
      const [
        usersResult,
        workersResult,
        factoriesResult,
        jobsResult,
        activeJobsResult,
        applicationsResult,
        conversationsResult,
        subscriptionsResult,
        recentUsersResult,
        recentJobsResult,
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'worker'),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'factory'),
        supabase.from('jobs').select('*', { count: 'exact', head: true }),
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('applications').select('*', { count: 'exact', head: true }),
        supabase.from('conversations').select('*', { count: 'exact', head: true }),
        supabase.from('subscriptions').select('*', { count: 'exact', head: true }).in('status', ['trial', 'active']),
        supabase.from('users').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('jobs').select('*, factory_profiles!jobs_factory_id_fkey(company_name)').order('created_at', { ascending: false }).limit(10),
      ])

      setStats({
        totalUsers: usersResult.count ?? 0,
        totalWorkers: workersResult.count ?? 0,
        totalFactories: factoriesResult.count ?? 0,
        totalJobs: jobsResult.count ?? 0,
        activeJobs: activeJobsResult.count ?? 0,
        totalApplications: applicationsResult.count ?? 0,
        totalConversations: conversationsResult.count ?? 0,
        activeSubscriptions: subscriptionsResult.count ?? 0,
      })

      if (recentUsersResult.data) setRecentUsers(recentUsersResult.data)
      if (recentJobsResult.data) setRecentJobs(recentJobsResult.data as JobWithFactory[])

      setLoading(false)
    }

    fetchDashboardData()
  }, [supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  const statCards = [
    { label: 'Tổng người dùng', value: stats.totalUsers, icon: Users, color: 'text-blue-600 bg-blue-100' },
    { label: 'Công nhân', value: stats.totalWorkers, icon: HardHat, color: 'text-emerald-600 bg-emerald-100' },
    { label: 'Nhà máy', value: stats.totalFactories, icon: Building2, color: 'text-purple-600 bg-purple-100' },
    { label: 'Tin tuyển dụng', value: stats.totalJobs, icon: Briefcase, color: 'text-indigo-600 bg-indigo-100' },
    { label: 'Tin đang tuyển', value: stats.activeJobs, icon: CheckCircle2, color: 'text-green-600 bg-green-100' },
    { label: 'Đơn ứng tuyển', value: stats.totalApplications, icon: FileText, color: 'text-amber-600 bg-amber-100' },
    { label: 'Cuộc trò chuyện', value: stats.totalConversations, icon: MessageSquare, color: 'text-pink-600 bg-pink-100' },
    { label: 'Gói dịch vụ hoạt động', value: stats.activeSubscriptions, icon: CreditCard, color: 'text-teal-600 bg-teal-100' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Tổng quan hệ thống</h1>
          <p className="text-gray-500 mt-1">Thống kê và dữ liệu nền tảng Labo</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => (
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
          {/* Recent Users */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Người dùng mới nhất</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="text-sm">{user.email || user.phone || '---'}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell className="text-sm text-gray-500">{formatDate(user.created_at)}</TableCell>
                      <TableCell>{getStatusBadge(user.is_active)}</TableCell>
                    </TableRow>
                  ))}
                  {recentUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                        Chưa có người dùng nào
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent Jobs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tin tuyển dụng mới nhất</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Nhà máy</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày đăng</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="text-sm font-medium">{job.title}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {job.factory_profiles?.company_name || '---'}
                      </TableCell>
                      <TableCell>{getJobStatusBadge(job.status)}</TableCell>
                      <TableCell className="text-sm text-gray-500">{formatDate(job.created_at)}</TableCell>
                    </TableRow>
                  ))}
                  {recentJobs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                        Chưa có tin tuyển dụng nào
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
