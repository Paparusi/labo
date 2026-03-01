'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

import Header from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin, Save, Loader2, Plus, X, Navigation, User as UserIcon } from 'lucide-react'
import { ProfileSkeleton } from '@/components/shared/PageSkeleton'
import { toast } from 'sonner'
import ImageUpload from '@/components/shared/ImageUpload'
import ChangePassword from '@/components/shared/ChangePassword'
import { useGeolocation } from '@/hooks/useGeolocation'
import type { WorkerProfile } from '@/types'

const SKILL_OPTIONS = [
  'May', 'Hàn', 'Lắp ráp', 'Kiểm tra chất lượng', 'Vận hành máy',
  'Lái xe nâng', 'Đóng gói', 'Hàn điện', 'Sơn', 'Điện', 'Mộc',
  'In ấn', 'Cắt', 'CNC', 'Bảo trì',
]

export default function WorkerProfilePage() {

  const [profile, setProfile] = useState<Partial<WorkerProfile>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newSkill, setNewSkill] = useState('')
  const { latitude, longitude } = useGeolocation()
  const supabase = createClient()

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      const { data } = await supabase.from('worker_profiles').select('*').eq('user_id', authUser.id).single()
      if (data) setProfile(data)
      setLoading(false)
    }
    fetchProfile()
  }, [supabase])

  const handleSave = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return

    setSaving(true)
    const { error } = await supabase
      .from('worker_profiles')
      .upsert({
        user_id: authUser.id,
        full_name: profile.full_name || '',
        date_of_birth: profile.date_of_birth,
        gender: profile.gender,
        address: profile.address,
        latitude: profile.latitude,
        longitude: profile.longitude,
        skills: profile.skills || [],
        experience_years: profile.experience_years || 0,
        availability: profile.availability || 'immediate',
        bio: profile.bio,
        avatar_url: profile.avatar_url,
      }, { onConflict: 'user_id' })

    setSaving(false)
    if (error) {
      toast.error('Lưu hồ sơ thất bại')
    } else {
      toast.success('Đã lưu hồ sơ thành công')
    }
  }

  const addSkill = (skill: string) => {
    if (!skill || profile.skills?.includes(skill)) return
    setProfile(prev => ({
      ...prev,
      skills: [...(prev.skills || []), skill],
    }))
    setNewSkill('')
  }

  const removeSkill = (skill: string) => {
    setProfile(prev => ({
      ...prev,
      skills: (prev.skills || []).filter(s => s !== skill),
    }))
  }

  const useCurrentLocation = () => {
    if (latitude && longitude) {
      setProfile(prev => ({ ...prev, latitude, longitude }))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <ProfileSkeleton />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Hồ sơ của tôi</h1>

        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin cá nhân</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <ImageUpload
                  bucket="avatars"
                  currentUrl={profile.avatar_url || null}
                  onUpload={(url) => setProfile(prev => ({ ...prev, avatar_url: url || null }))}
                  size="lg"
                  shape="circle"
                  placeholder={<UserIcon className="h-8 w-8 text-gray-400" />}
                />
                <div>
                  <p className="font-medium text-gray-900">Ảnh đại diện</p>
                  <p className="text-sm text-gray-500">Nhấn vào ảnh để thay đổi</p>
                </div>
              </div>
              <div>
                <Label>Họ và tên</Label>
                <Input
                  value={profile.full_name || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Ngày sinh</Label>
                  <Input
                    type="date"
                    value={profile.date_of_birth || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, date_of_birth: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Giới tính</Label>
                  <Select
                    value={profile.gender || ''}
                    onValueChange={(v) => setProfile(prev => ({ ...prev, gender: v as 'male' | 'female' | 'other' }))}
                  >
                    <SelectTrigger><SelectValue placeholder="Chọn" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Nam</SelectItem>
                      <SelectItem value="female">Nữ</SelectItem>
                      <SelectItem value="other">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Bio / Giới thiệu bản thân</Label>
                <Textarea
                  value={profile.bio || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Viết vài dòng giới thiệu về bản thân, kinh nghiệm làm việc..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Vị trí</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Địa chỉ</Label>
                <Input
                  value={profile.address || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Số nhà, đường, phường/xã..."
                />
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={useCurrentLocation}>
                  <Navigation className="h-4 w-4 mr-2" />
                  Dùng vị trí hiện tại
                </Button>
                {profile.latitude && profile.longitude && (
                  <span className="text-sm text-gray-500">
                    <MapPin className="h-3.5 w-3.5 inline mr-1" />
                    {profile.latitude.toFixed(4)}, {profile.longitude.toFixed(4)}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Skills & Experience */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Kỹ năng & Kinh nghiệm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Kỹ năng</Label>
                <div className="flex flex-wrap gap-2 mt-2 mb-3">
                  {(profile.skills || []).map(skill => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <button onClick={() => removeSkill(skill)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {SKILL_OPTIONS.filter(s => !profile.skills?.includes(s)).map(skill => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="cursor-pointer hover:bg-emerald-50"
                      onClick={() => addSkill(skill)}
                    >
                      <Plus className="h-3 w-3 mr-1" />{skill}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Kinh nghiệm (năm)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={profile.experience_years || 0}
                    onChange={(e) => setProfile(prev => ({ ...prev, experience_years: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>Khả dụng</Label>
                  <Select
                    value={profile.availability || 'immediate'}
                    onValueChange={(v) => setProfile(prev => ({ ...prev, availability: v as 'immediate' | 'one_week' | 'one_month' }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Sẵn sàng ngay</SelectItem>
                      <SelectItem value="one_week">Trong 1 tuần</SelectItem>
                      <SelectItem value="one_month">Trong 1 tháng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save */}
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Lưu hồ sơ
          </Button>

          {/* Change Password */}
          <ChangePassword />
        </div>
      </div>
    </div>
  )
}
