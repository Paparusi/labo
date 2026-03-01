'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

import Header from '@/components/layout/Header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, FileText, Trash2, Copy, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import type { JobTemplate } from '@/types'

const INDUSTRY_LABELS: Record<string, string> = {
  electronics: 'Điện tử', garment: 'May mặc', footwear: 'Giày dép',
  food: 'Thực phẩm', furniture: 'Nội thất', mechanical: 'Cơ khí',
  packaging: 'Đóng gói', plastics: 'Nhựa', other: 'Khác',
}

const SHIFT_LABELS: Record<string, string> = {
  day: 'Ca ngày', night: 'Ca đêm', rotating: 'Ca xoay', flexible: 'Linh hoạt',
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<JobTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function fetchTemplates() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('job_templates')
        .select('*')
        .eq('factory_id', user.id)
        .order('created_at', { ascending: false })
      if (data) setTemplates(data)
      setLoading(false)
    }
    fetchTemplates()
  }, [supabase])

  const handleDelete = async () => {
    if (!deleteId) return
    const { error } = await supabase.from('job_templates').delete().eq('id', deleteId)
    if (error) {
      toast.error('Không thể xóa mẫu')
      return
    }
    setTemplates(prev => prev.filter(t => t.id !== deleteId))
    setDeleteId(null)
    toast.success('Đã xóa mẫu tin tuyển dụng')
  }

  const useTemplate = (template: JobTemplate) => {
    const params = new URLSearchParams({ template: template.id })
    router.push(`/factory/jobs/new?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-6 animate-fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mẫu tin tuyển dụng</h1>
            <p className="text-sm text-gray-500 mt-1">Tạo và quản lý mẫu để đăng tin nhanh hơn</p>
          </div>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/factory/templates/new"><Plus className="h-4 w-4 mr-2" />Tạo mẫu mới</Link>
          </Button>
        </div>

        <ConfirmDialog
          open={!!deleteId}
          onOpenChange={(open) => { if (!open) setDeleteId(null) }}
          title="Xóa mẫu tin tuyển dụng"
          description="Bạn có chắc muốn xóa mẫu này? Hành động này không thể hoàn tác."
          confirmLabel="Xóa"
          variant="destructive"
          onConfirm={handleDelete}
        />

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">Chưa có mẫu nào</p>
            <p className="text-sm mt-1">Tạo mẫu để đăng tin tuyển dụng nhanh hơn</p>
            <Button asChild className="mt-4 bg-emerald-600 hover:bg-emerald-700">
              <Link href="/factory/templates/new"><Plus className="h-4 w-4 mr-2" />Tạo mẫu đầu tiên</Link>
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => {
              const data = template.template_data
              return (
                <Card key={template.id} className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{template.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Tạo {new Date(template.created_at).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>

                    {data.title && (
                      <p className="text-sm text-gray-700 mb-2 truncate">
                        {data.title}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {data.industry && (
                        <Badge variant="secondary" className="text-xs">
                          {INDUSTRY_LABELS[data.industry] || data.industry}
                        </Badge>
                      )}
                      {data.shift_type && (
                        <Badge variant="outline" className="text-xs">
                          {SHIFT_LABELS[data.shift_type] || data.shift_type}
                        </Badge>
                      )}
                      {data.positions && data.positions > 1 && (
                        <Badge variant="outline" className="text-xs">
                          {data.positions} vị trí
                        </Badge>
                      )}
                    </div>

                    {data.skills_required && data.skills_required.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {data.skills_required.slice(0, 3).map(s => (
                          <span key={s} className="text-xs bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">
                            {s}
                          </span>
                        ))}
                        {data.skills_required.length > 3 && (
                          <span className="text-xs text-gray-400">+{data.skills_required.length - 3}</span>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 mt-3 pt-3 border-t">
                      <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => useTemplate(template)}>
                        <Copy className="h-3.5 w-3.5 mr-1.5" />Dùng mẫu
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-600" onClick={() => setDeleteId(template.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
