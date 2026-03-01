'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Save, Loader2, Navigation, MapPin, Building2 } from 'lucide-react'
import ImageUpload from '@/components/shared/ImageUpload'
import { useGeolocation } from '@/hooks/useGeolocation'
import type { User, FactoryProfile } from '@/types'

const INDUSTRIES = [
  { value: 'electronics', label: 'Điện tử' },
  { value: 'garment', label: 'May mặc' },
  { value: 'footwear', label: 'Giày dép' },
  { value: 'food', label: 'Thực phẩm' },
  { value: 'furniture', label: 'Nội thất' },
  { value: 'mechanical', label: 'Cơ khí' },
  { value: 'packaging', label: 'Đóng gói' },
  { value: 'plastics', label: 'Nhựa' },
  { value: 'other', label: 'Khác' },
]

export default function FactoryProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Partial<FactoryProfile>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { latitude, longitude } = useGeolocation()
  const supabase = createClient()

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return
      const { data: userData } = await supabase.from('users').select('*').eq('id', authUser.id).single()
      setUser(userData)
      const { data } = await supabase.from('factory_profiles').select('*').eq('user_id', authUser.id).single()
      if (data) setProfile(data)
      setLoading(false)
    }
    fetchProfile()
  }, [supabase])

  const handleSave = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return
    setSaving(true)
    await supabase.from('factory_profiles').upsert({
      user_id: authUser.id,
      company_name: profile.company_name || '',
      industry: profile.industry,
      address: profile.address,
      latitude: profile.latitude,
      longitude: profile.longitude,
      size: profile.size || 'medium',
      contact_person: profile.contact_person,
      contact_phone: profile.contact_phone,
      description: profile.description,
      website: profile.website,
      logo_url: profile.logo_url,
    }, { onConflict: 'user_id' })
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} />
        <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Hồ sơ công ty</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Thông tin công ty</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <ImageUpload
                  bucket="logos"
                  currentUrl={profile.logo_url || null}
                  onUpload={(url) => setProfile(prev => ({ ...prev, logo_url: url || null }))}
                  size="lg"
                  shape="square"
                  placeholder={<Building2 className="h-8 w-8 text-gray-400" />}
                />
                <div>
                  <p className="font-medium text-gray-900">Logo công ty</p>
                  <p className="text-sm text-gray-500">Nhấn vào logo để thay đổi</p>
                </div>
              </div>
              <div>
                <Label>Tên công ty *</Label>
                <Input value={profile.company_name || ''} onChange={(e) => setProfile(prev => ({ ...prev, company_name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Ngành nghề</Label>
                  <Select value={profile.industry || ''} onValueChange={(v) => setProfile(prev => ({ ...prev, industry: v }))}>
                    <SelectTrigger><SelectValue placeholder="Chọn ngành" /></SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map(i => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Quy mô</Label>
                  <Select value={profile.size || 'medium'} onValueChange={(v) => setProfile(prev => ({ ...prev, size: v as 'small' | 'medium' | 'large' }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Nhỏ (&lt; 50 người)</SelectItem>
                      <SelectItem value="medium">Vừa (50-200 người)</SelectItem>
                      <SelectItem value="large">Lớn (&gt; 200 người)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Mô tả công ty</Label>
                <Textarea value={profile.description || ''} onChange={(e) => setProfile(prev => ({ ...prev, description: e.target.value }))} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Người liên hệ</Label>
                  <Input value={profile.contact_person || ''} onChange={(e) => setProfile(prev => ({ ...prev, contact_person: e.target.value }))} />
                </div>
                <div>
                  <Label>Số điện thoại</Label>
                  <Input value={profile.contact_phone || ''} onChange={(e) => setProfile(prev => ({ ...prev, contact_phone: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>Website</Label>
                <Input value={profile.website || ''} onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))} placeholder="https://" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Vị trí nhà máy</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Địa chỉ</Label>
                <Input value={profile.address || ''} onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))} placeholder="Địa chỉ nhà máy..." />
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => {
                  if (latitude && longitude) setProfile(prev => ({ ...prev, latitude, longitude }))
                }}>
                  <Navigation className="h-4 w-4 mr-2" />Dùng vị trí hiện tại
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

          <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Lưu hồ sơ
          </Button>
        </div>
      </div>
    </div>
  )
}
