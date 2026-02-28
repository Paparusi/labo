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
import { Loader2, Plus, X, Save, Navigation } from 'lucide-react'
import { useGeolocation } from '@/hooks/useGeolocation'
import type { User } from '@/types'

const INDUSTRIES = [
  'electronics', 'garment', 'footwear', 'food',
  'furniture', 'mechanical', 'packaging', 'plastics', 'other',
]

const INDUSTRY_LABELS: Record<string, string> = {
  electronics: 'Dien tu', garment: 'May mac', footwear: 'Giay dep',
  food: 'Thuc pham', furniture: 'Noi that', mechanical: 'Co khi',
  packaging: 'Dong goi', plastics: 'Nhua', other: 'Khac',
}

const SKILL_OPTIONS = [
  'May', 'Han', 'Lap rap', 'Kiem tra chat luong', 'Van hanh may',
  'Lai xe nang', 'Dong goi', 'Han dien', 'Son', 'Dien', 'Moc',
]

export default function NewJobPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
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

    if (!error) {
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dang tin tuyen dung</h1>

        <form onSubmit={(e) => handleSubmit(e, 'active')} className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Thong tin viec lam</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tieu de *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="VD: Tuyen cong nhan lap rap dien tu"
                  required
                />
              </div>
              <div>
                <Label>Mo ta cong viec</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Mo ta chi tiet cong viec, yeu cau, quyen loi..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nganh nghe</Label>
                  <Select value={form.industry} onValueChange={(v) => setForm(prev => ({ ...prev, industry: v }))}>
                    <SelectTrigger><SelectValue placeholder="Chon nganh" /></SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map(i => (
                        <SelectItem key={i} value={i}>{INDUSTRY_LABELS[i]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>So luong tuyen</Label>
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
            <CardHeader><CardTitle className="text-lg">Luong & Ca lam</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Luong toi thieu (VND)</Label>
                  <Input
                    type="number"
                    value={form.salary_min}
                    onChange={(e) => setForm(prev => ({ ...prev, salary_min: e.target.value }))}
                    placeholder="5000000"
                  />
                </div>
                <div>
                  <Label>Luong toi da (VND)</Label>
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
                  <Label>Ca lam viec</Label>
                  <Select value={form.shift_type} onValueChange={(v) => setForm(prev => ({ ...prev, shift_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Ca ngay</SelectItem>
                      <SelectItem value="night">Ca dem</SelectItem>
                      <SelectItem value="rotating">Ca xoay</SelectItem>
                      <SelectItem value="flexible">Linh hoat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Yeu cau gioi tinh</Label>
                  <Select value={form.gender_requirement} onValueChange={(v) => setForm(prev => ({ ...prev, gender_requirement: v }))}>
                    <SelectTrigger><SelectValue placeholder="Khong yeu cau" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Khong yeu cau</SelectItem>
                      <SelectItem value="male">Nam</SelectItem>
                      <SelectItem value="female">Nu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Ngay bat dau</Label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Ky nang yeu cau</CardTitle></CardHeader>
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
            <CardHeader><CardTitle className="text-lg">Dia diem lam viec</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Dia chi</Label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Dia chi nha may..."
                />
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => {
                if (latitude && longitude) setForm(prev => ({ ...prev, latitude, longitude }))
              }}>
                <Navigation className="h-4 w-4 mr-2" />Dung vi tri hien tai
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
              Luu nhap
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Dang tin tuyen
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
