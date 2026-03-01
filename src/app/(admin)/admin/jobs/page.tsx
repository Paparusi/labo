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
import { Loader2, ChevronLeft, ChevronRight, XCircle, RotateCcw } from 'lucide-react'
import type { Job, JobStatus } from '@/types'

const JOBS_PER_PAGE = 20

interface JobWithDetails extends Job {
  factory_profiles: { company_name: string } | null
  applications: { count: number }[]
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
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

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<JobWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const supabase = createClient()

  const fetchJobs = useCallback(async () => {
    setLoading(true)

    let query = supabase
      .from('jobs')
      .select(
        '*, factory_profiles!jobs_factory_profile_fkey(company_name), applications(count)',
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(page * JOBS_PER_PAGE, (page + 1) * JOBS_PER_PAGE - 1)

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter as JobStatus)
    }

    const { data, count } = await query

    if (data) setJobs(data as JobWithDetails[])
    setTotalCount(count ?? 0)
    setLoading(false)
  }, [supabase, page, statusFilter])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  async function handleUpdateStatus(jobId: string, newStatus: JobStatus) {
    setUpdatingId(jobId)

    const { error } = await supabase
      .from('jobs')
      .update({ status: newStatus })
      .eq('id', jobId)

    if (!error) {
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
      )
    }

    setUpdatingId(null)
  }

  function getApplicationCount(job: JobWithDetails): number {
    if (!job.applications || job.applications.length === 0) return 0
    return job.applications[0]?.count ?? 0
  }

  const totalPages = Math.ceil(totalCount / JOBS_PER_PAGE)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Quản lý tin tuyển dụng</h1>
          <p className="text-gray-500 mt-1">Kiểm duyệt và quản lý tin tuyển dụng trên nền tảng</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="text-lg">
                Danh sách tin tuyển dụng ({totalCount})
              </CardTitle>

              {/* Status filter */}
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
                  <SelectItem value="active">Đang tuyển</SelectItem>
                  <SelectItem value="closed">Đã đóng</SelectItem>
                  <SelectItem value="draft">Bản nháp</SelectItem>
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
                      <TableHead>Tiêu đề</TableHead>
                      <TableHead>Nhà máy</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày đăng</TableHead>
                      <TableHead>Số ứng viên</TableHead>
                      <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="text-sm font-medium max-w-[200px] truncate">
                          {job.title}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {job.factory_profiles?.company_name || '---'}
                        </TableCell>
                        <TableCell>{getJobStatusBadge(job.status)}</TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {formatDate(job.created_at)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-700">
                          {getApplicationCount(job)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {job.status === 'active' && (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={updatingId === job.id}
                                onClick={() => handleUpdateStatus(job.id, 'closed')}
                                className="text-red-600 hover:bg-red-50 border-red-200"
                              >
                                {updatingId === job.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Đóng
                                  </>
                                )}
                              </Button>
                            )}
                            {(job.status === 'closed' || job.status === 'draft') && (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={updatingId === job.id}
                                onClick={() => handleUpdateStatus(job.id, 'active')}
                                className="text-emerald-600 hover:bg-emerald-50 border-emerald-200"
                              >
                                {updatingId === job.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <RotateCcw className="h-4 w-4 mr-1" />
                                    Mở lại
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {jobs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                          Không tìm thấy tin tuyển dụng nào
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <p className="text-sm text-gray-500">
                      Trang {page + 1} / {totalPages} (tổng {totalCount} tin tuyển dụng)
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 0}
                        onClick={() => setPage((p) => p - 1)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Trước
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages - 1}
                        onClick={() => setPage((p) => p + 1)}
                      >
                        Sau
                        <ChevronRight className="h-4 w-4" />
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
