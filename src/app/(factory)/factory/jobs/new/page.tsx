'use client'

import { useState, useEffect } from 'react'
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
import { Loader2, Plus, X, Save, Navigation, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { useGeolocation } from '@/hooks/useGeolocation'
import { canPostJob } from '@/lib/subscription'
import type { User, Subscription, SubscriptionPlan } from '@/types'

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

export default function NewJobPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null)
  const [activeJobCount, setActiveJobCount] = useState(0)
  const [limitChecked, setLimitChecked] = useState(false)
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
    start_date: '',
    address: '',
    latitude: null as number | null,
    longitude: null as number | null,
  })
  const router = useRouter()
  const { latitude, longitude } = useGeolocation()
  const supabase = createClient()

  useEffect(() => {
    async function fetchUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data } = await supabase.from('users').select('*').eq('id', authUser.id).single()
        setUser(data)

        // Check subscription limits
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('*, plan:subscription_plans(*)')
          .eq('factory_id', authUser.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        if (sub) {
          setSubscription(sub)
          setPlan(sub.plan)
        }
        const { count } = await supabase
          .from('jobs')
          .select('id', { count: 'exact', head: true })
          .eq('factory_id', authUser.id)
          .eq('status', 'active')
        setActiveJobCount(count || 0)
        setLimitChecked(true)

        // Get factory location as default
        const { data: factory } = await supabase
          .from('factory_profiles')
          .select('latitude, longitude, address')
          .eq('user_id', authUser.id)
          .single()

        if (factory) {
          setForm(prev => ({
            ...prev,
            latitude: factory.latitude,
            longitude: factory.longitude,
            address: factory.address || '',
          }))
        }
      }
    }
    fetchUser()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent, status: 'active' | 'draft' = 'active') => {
    e.preventDefault()
    setLoading(true)

    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return

    const { error } = await supabase.from('jobs').insert({
      factory_id: authUser.id,
      title: form.title,
      description: form.description || null,
      industry: form.industry || null,
      skills_required: form.skills_required,
      salary_min: form.salary_min ? Number(form.salary_min) : null,
      salary_max: form.salary_max ? Number(form.salary_max) : null,
      positions: Number(form.positions) || 1,
      shift_type: form.shift_type,
      gender_requirement: form.gender_requirement || null,
      start_date: form.start_date || null,
      address: form.address || null,
      latitude: form.latitude,
      longitude: form.longitude,
      status,
    })

    if (error) {
      toast.error('Đăng tin thất bại. Vui lòng thử lại.')
    } else {
      toast.success(status === 'draft' ? 'Đã lưu bản nháp' : 'Đã đăng tin tuyển dụng')
      router.push('/factory/jobs')
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
      <Header user={user} />
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Đăng tin tuyển dụng</h1>

        {limitChecked && !canPostJob(subscription, plan, activeJobCount) && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-amber-800">Đã đạt giới hạn đăng tin</p>
              <p className="text-sm text-amber-700 mt-1">
                Gói hiện tại cho phép tối đa {plan?.max_job_posts || 0} tin tuyển dụng đang hoạt động.
                Bạn đang có {activeJobCount} tin. Vui lòng nâng cấp gói để đăng thêm.
              </p>
              <Button asChild size="sm" className="mt-3 bg-amber-600 hover:bg-amber-700">
                <a href="/factory/subscription">Nâng cấp gói</a>
              </Button>
            </div>
          </div>
        )}

        <form onSubmit={(e) => handleSubmit(e, 'active')} className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Thông tin việc làm</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tiêu đề *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="VD: Tuyển công nhân lắp ráp điện tử"
                  required
                />
              </div>
              <div>
                <Label>Mô tả công việc</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Mô tả chi tiết công việc, yêu cầu, quyền lợi..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
              <div className="grid grid-cols-2 gap-4">
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
              <div className="grid grid-cols-2 gap-4">
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
              <div>
                <Label>Ngày bắt đầu</Label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm(prev => ({ ...prev, start_date: e.target.value }))}
                />
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

          <Card>
            <CardHeader><CardTitle className="text-lg">Địa điểm làm việc</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Địa chỉ</Label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Địa chỉ nhà máy..."
                />
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => {
                if (latitude && longitude) setForm(prev => ({ ...prev, latitude, longitude }))
              }}>
                <Navigation className="h-4 w-4 mr-2" />Dùng vị trí hiện tại
              </Button>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={(e) => handleSubmit(e as unknown as React.FormEvent, 'draft')}
              disabled={loading}
            >
              Lưu nháp
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              disabled={loading || (limitChecked && !canPostJob(subscription, plan, activeJobCount))}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Đăng tin tuyển
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
