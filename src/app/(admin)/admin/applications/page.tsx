'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table'
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import type { ApplicationStatus } from '@/types'

const APPS_PER_PAGE = 20

interface AppWithDetails {
  id: string
  status: string
  applied_at: string
  worker_profiles: { full_name: string } | null
  jobs: { title: string; factory_profiles: { company_name: string } | null } | null
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

function getStatusBadge(status: string): React.ReactNode {
  switch (status) {
    case 'pending':
      return <Badge className="bg-yellow-100 text-yellow-700">Chờ xử lý</Badge>
    case 'accepted':
      return <Badge className="bg-green-100 text-green-700">Chấp nhận</Badge>
    case 'rejected':
      return <Badge className="bg-red-100 text-red-700">Từ chối</Badge>
    case 'withdrawn':
      return <Badge className="bg-gray-100 text-gray-500">Đã rút</Badge>
    default:
      return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>
  }
}

export default function AdminApplicationsPage() {
  const [apps, setApps] = useState<AppWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const supabase = createClient()

  const fetchApps = useCallback(async () => {
    setLoading(true)

    let query = supabase
      .from('applications')
      .select(
        '*, worker_profiles!applications_worker_profile_fkey(full_name), jobs!inner(title, factory_profiles!jobs_factory_profile_fkey(company_name))',
        { count: 'exact' }
      )
      .order('applied_at', { ascending: false })
      .range(page * APPS_PER_PAGE, (page + 1) * APPS_PER_PAGE - 1)

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter as ApplicationStatus)
    }

    const { data, count } = await query

    if (data) setApps(data as unknown as AppWithDetails[])
    setTotalCount(count ?? 0)
    setLoading(false)
  }, [supabase, page, statusFilter])

  useEffect(() => {
    fetchApps()
  }, [fetchApps])

  const totalPages = Math.ceil(totalCount / APPS_PER_PAGE)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn ứng tuyển</h1>
          <p className="text-gray-500 mt-1">Xem tất cả đơn ứng tuyển trên nền tảng</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="text-lg">
                Danh sách đơn ứng tuyển ({totalCount})
              </CardTitle>

              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value)
                  setPage(0)
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Lọc trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="pending">Chờ xử lý</SelectItem>
                  <SelectItem value="accepted">Chấp nhận</SelectItem>
                  <SelectItem value="rejected">Từ chối</SelectItem>
                  <SelectItem value="withdrawn">Đã rút</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ứng viên</TableHead>
                      <TableHead>Vị trí</TableHead>
                      <TableHead>Nhà máy</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày nộp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apps.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="text-sm font-medium">
                          {app.worker_profiles?.full_name || '---'}
                        </TableCell>
                        <TableCell className="text-sm text-gray-700 max-w-[200px] truncate">
                          {app.jobs?.title || '---'}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {app.jobs?.factory_profiles?.company_name || '---'}
                        </TableCell>
                        <TableCell>{getStatusBadge(app.status)}</TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {formatDate(app.applied_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {apps.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                          Không tìm thấy đơn ứng tuyển nào
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <p className="text-sm text-gray-500">
                      Trang {page + 1} / {totalPages} (tổng {totalCount} đơn)
                    </p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                        <ChevronLeft className="h-4 w-4" />Trước
                      </Button>
                      <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                        Sau<ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
