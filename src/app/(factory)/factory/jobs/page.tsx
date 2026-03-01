'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'
import Header from '@/components/layout/Header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Users, Clock, MapPin, Eye, Trash2, Pencil } from 'lucide-react'
import { JobListSkeleton } from '@/components/shared/PageSkeleton'
import { toast } from 'sonner'
import { formatSalaryRange } from '@/lib/geo'
import { Loader2 } from 'lucide-react'
import type { Job } from '@/types'

const PAGE_SIZE = 20

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  active: { label: 'Đang tuyển', color: 'bg-green-100 text-green-700' },
  closed: { label: 'Đã đóng', color: 'bg-gray-100 text-gray-700' },
  draft: { label: 'Bản nháp', color: 'bg-yellow-100 text-yellow-700' },
}

export default function FactoryJobsPage() {
  const { user } = useUser()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      const { data } = await supabase
        .from('jobs')
        .select('*, applications(count)')
        .eq('factory_id', authUser.id)
        .order('created_at', { ascending: false })

      if (data) {
        setJobs(data.map((j: Record<string, unknown>) => ({
          ...j,
          _applications_count: ((j.applications as Array<{ count: number }>)?.[0]?.count) || 0,
        })) as unknown as Job[])
      }
      setLoading(false)
    }
    fetchData()
  }, [supabase])

  const toggleJobStatus = async (jobId: string, newStatus: 'active' | 'closed') => {
    const { error } = await supabase.from('jobs').update({ status: newStatus }).eq('id', jobId)
    if (error) {
      toast.error('Không thể cập nhật trạng thái')
      return
    }
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j))
    toast.success(newStatus === 'active' ? 'Đã mở lại tin tuyển dụng' : 'Đã đóng tin tuyển dụng')
  }

  const deleteJob = async (jobId: string) => {
    if (!confirm('Bạn có chắc muốn xóa tin tuyển dụng này?')) return
    const { error } = await supabase.from('jobs').delete().eq('id', jobId)
    if (error) {
      toast.error('Không thể xóa tin tuyển dụng')
      return
    }
    setJobs(prev => prev.filter(j => j.id !== jobId))
    toast.success('Đã xóa tin tuyển dụng')
  }

  const filterByStatus = (status: string) => {
    if (status === 'all') return jobs
    return jobs.filter(j => j.status === status)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Tin tuyển dụng</h1>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/factory/jobs/new"><Plus className="h-4 w-4 mr-2" />Đăng tin mới</Link>
          </Button>
        </div>

        {loading ? (
          <JobListSkeleton />
        ) : (
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">Tất cả ({jobs.length})</TabsTrigger>
              <TabsTrigger value="active">Đang tuyển ({filterByStatus('active').length})</TabsTrigger>
              <TabsTrigger value="draft">Bản nháp ({filterByStatus('draft').length})</TabsTrigger>
              <TabsTrigger value="closed">Đã đóng ({filterByStatus('closed').length})</TabsTrigger>
            </TabsList>

            {['all', 'active', 'draft', 'closed'].map(tab => (
              <TabsContent key={tab} value={tab} className="space-y-3">
                {filterByStatus(tab).length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>Không có tin tuyển dụng nào</p>
                    <Button asChild className="mt-3 bg-emerald-600 hover:bg-emerald-700">
                      <Link href="/factory/jobs/new">Đăng tin ngay</Link>
                    </Button>
                  </div>
                ) : (
                  <>
                    {filterByStatus(tab).slice(0, displayCount).map(job => (
                      <Card key={job.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900">{job.title}</h3>
                                <Badge className={STATUS_MAP[job.status]?.color}>
                                  {STATUS_MAP[job.status]?.label}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                                <span>{formatSalaryRange(job.salary_min, job.salary_max)}</span>
                                <span>{job.positions} vị trí</span>
                                {job.address && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5" />{job.address}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Users className="h-3.5 w-3.5" />
                                  {job._applications_count || 0} ứng viên
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {new Date(job.created_at).toLocaleDateString('vi-VN')}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/factory/jobs/${job.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/factory/jobs/${job.id}/edit`}>
                                  <Pencil className="h-4 w-4" />
                                </Link>
                              </Button>
                              {job.status === 'active' ? (
                                <Button variant="ghost" size="sm" onClick={() => toggleJobStatus(job.id, 'closed')}>
                                  Đóng
                                </Button>
                              ) : job.status === 'closed' || job.status === 'draft' ? (
                                <Button variant="ghost" size="sm" onClick={() => toggleJobStatus(job.id, 'active')}>
                                  Mở lại
                                </Button>
                              ) : null}
                              {job.status === 'draft' && (
                                <Button variant="ghost" size="sm" className="text-red-600" onClick={() => deleteJob(job.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {displayCount < filterByStatus(tab).length && (
                      <div className="text-center pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setDisplayCount(prev => prev + PAGE_SIZE)}
                        >
                          Xem thêm ({filterByStatus(tab).length - displayCount} tin còn lại)
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  )
}
