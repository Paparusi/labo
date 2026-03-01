'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

import Header from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Plus, X, Save, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

const INDUSTRIES = [
  'electronics', 'garment', 'footwear', 'food',
  'furniture', 'mechanical', 'packaging', 'plastics', 'other',
]

const INDUSTRY_LABELS: Record<string, string> = {
  electronics: 'Điện tử', garment: 'May mặc', footwear: 'Giày dép',
  food: 'Thực phẩm', furniture: 'Nội thất', mechanical: 'Cơ khí',
  packaging: 'Đóng gói', plastics: 'Nhựa', other: 'Khác',
}

const SKILL_OPTIONS = [
  'May', 'Hàn', 'Lắp ráp', 'Kiểm tra chất lượng', 'Vận hành máy',
  'Lái xe nâng', 'Đóng gói', 'Hàn điện', 'Sơn', 'Điện', 'Mộc',
]

export default function NewTemplatePage() {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [form, setForm] = useState({
    title: '',
    description: '',
    industry: '',
    skills_required: [] as string[],
    salary_min: '',
    salary_max: '',
    positions: '1',
    shift_type: 'day',
    gender_requirement: '',
  })
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên mẫu')
      return
    }
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const template_data: Record<string, unknown> = {}
    if (form.title) template_data.title = form.title
    if (form.description) template_data.description = form.description
    if (form.industry) template_data.industry = form.industry
    if (form.skills_required.length > 0) template_data.skills_required = form.skills_required
    if (form.salary_min) template_data.salary_min = Number(form.salary_min)
    if (form.salary_max) template_data.salary_max = Number(form.salary_max)
    if (form.positions && form.positions !== '1') template_data.positions = Number(form.positions)
    if (form.shift_type && form.shift_type !== 'day') template_data.shift_type = form.shift_type
    if (form.gender_requirement) template_data.gender_requirement = form.gender_requirement

    const { error } = await supabase.from('job_templates').insert({
      factory_id: user.id,
      name: name.trim(),
      template_data,
    })

    if (error) {
      toast.error('Tạo mẫu thất bại')
    } else {
      toast.success('Đã tạo mẫu tin tuyển dụng')
      router.push('/factory/templates')
    }
    setLoading(false)
  }

  const addSkill = (skill: string) => {
    if (!form.skills_required.includes(skill)) {
      setForm(prev => ({ ...prev, skills_required: [...prev.skills_required, skill] }))
    }
  }

  const removeSkill = (skill: string) => {
    setForm(prev => ({ ...prev, skills_required: prev.skills_required.filter(s => s !== skill) }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-6 max-w-2xl animate-fade-in-up">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Tạo mẫu tin tuyển dụng</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Tên mẫu</CardTitle></CardHeader>
            <CardContent>
              <div>
                <Label>Tên mẫu *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Mẫu tuyển công nhân lắp ráp"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Đặt tên dễ nhớ để sử dụng lại sau</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Thông tin việc làm</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tiêu đề mẫu</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="VD: Tuyển công nhân lắp ráp điện tử"
                />
              </div>
              <div>
                <Label>Mô tả mẫu</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Mô tả chi tiết công việc..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Ngành nghề</Label>
                  <Select value={form.industry} onValueChange={(v) => setForm(prev => ({ ...prev, industry: v }))}>
                    <SelectTrigger><SelectValue placeholder="Chọn ngành" /></SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map(i => (
                        <SelectItem key={i} value={i}>{INDUSTRY_LABELS[i]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Số lượng tuyển</Label>
                  <Input
                    type="number"
                    min={1}
                    value={form.positions}
                    onChange={(e) => setForm(prev => ({ ...prev, positions: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Lương & Ca làm</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Lương tối thiểu (VND)</Label>
                  <Input
                    type="number"
                    value={form.salary_min}
                    onChange={(e) => setForm(prev => ({ ...prev, salary_min: e.target.value }))}
                    placeholder="5000000"
                  />
                </div>
                <div>
                  <Label>Lương tối đa (VND)</Label>
                  <Input
                    type="number"
                    value={form.salary_max}
                    onChange={(e) => setForm(prev => ({ ...prev, salary_max: e.target.value }))}
                    placeholder="8000000"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Ca làm việc</Label>
                  <Select value={form.shift_type} onValueChange={(v) => setForm(prev => ({ ...prev, shift_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Ca ngày</SelectItem>
                      <SelectItem value="night">Ca đêm</SelectItem>
                      <SelectItem value="rotating">Ca xoay</SelectItem>
                      <SelectItem value="flexible">Linh hoạt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Yêu cầu giới tính</Label>
                  <Select value={form.gender_requirement} onValueChange={(v) => setForm(prev => ({ ...prev, gender_requirement: v }))}>
                    <SelectTrigger><SelectValue placeholder="Không yêu cầu" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Không yêu cầu</SelectItem>
                      <SelectItem value="male">Nam</SelectItem>
                      <SelectItem value="female">Nữ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Kỹ năng yêu cầu</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-3">
                {form.skills_required.map(skill => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)}><X className="h-3 w-3" /></button>
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {SKILL_OPTIONS.filter(s => !form.skills_required.includes(s)).map(skill => (
                  <Badge key={skill} variant="outline" className="cursor-pointer hover:bg-emerald-50" onClick={() => addSkill(skill)}>
                    <Plus className="h-3 w-3 mr-1" />{skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.push('/factory/templates')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />Quay lại
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Lưu mẫu
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
