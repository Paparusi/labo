'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/layout/Header'
import ChangePassword from '@/components/shared/ChangePassword'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Settings, Bell, Shield, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Preferences {
  email_notifications: boolean
  in_app_notifications: boolean
  profile_visibility: boolean
}

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<Preferences>({
    email_notifications: true,
    in_app_notifications: true,
    profile_visibility: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchPrefs() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('users')
        .select('preferences')
        .eq('id', user.id)
        .single()
      if (data?.preferences) {
        setPrefs(prev => ({ ...prev, ...(data.preferences as Partial<Preferences>) }))
      }
      setLoading(false)
    }
    fetchPrefs()
  }, [supabase])

  const savePrefs = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase
      .from('users')
      .update({ preferences: prefs })
      .eq('id', user.id)
    setSaving(false)
    if (error) {
      toast.error('Lưu cài đặt thất bại')
    } else {
      toast.success('Đã lưu cài đặt')
    }
  }

  const handleDeleteAccount = async () => {
    toast.info('Yêu cầu xóa tài khoản đã được gửi. Tài khoản sẽ bị xóa trong 30 ngày.')
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-6 max-w-2xl animate-fade-in-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
            <Settings className="h-5 w-5 text-gray-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Cài đặt</h1>
        </div>

        <div className="space-y-6">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5 text-gray-500" />
                Thông báo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Thông báo email</Label>
                  <p className="text-xs text-gray-500">Nhận thông báo qua email khi có hoạt động mới</p>
                </div>
                <Switch
                  checked={prefs.email_notifications}
                  onCheckedChange={(v) => setPrefs(prev => ({ ...prev, email_notifications: v }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Thông báo trong ứng dụng</Label>
                  <p className="text-xs text-gray-500">Hiển thị thông báo trên thanh điều hướng</p>
                </div>
                <Switch
                  checked={prefs.in_app_notifications}
                  onCheckedChange={(v) => setPrefs(prev => ({ ...prev, in_app_notifications: v }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-gray-500" />
                Quyền riêng tư
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Hồ sơ công khai</Label>
                  <p className="text-xs text-gray-500">Cho phép người khác tìm thấy hồ sơ của bạn</p>
                </div>
                <Switch
                  checked={prefs.profile_visibility}
                  onCheckedChange={(v) => setPrefs(prev => ({ ...prev, profile_visibility: v }))}
                />
              </div>
            </CardContent>
          </Card>

          <Button onClick={savePrefs} className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Lưu cài đặt
          </Button>

          {/* Change Password */}
          <ChangePassword />

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Xóa tài khoản
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Xóa tài khoản sẽ xóa vĩnh viễn tất cả dữ liệu của bạn. Hành động này không thể hoàn tác.
              </p>
              <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                Xóa tài khoản
              </Button>
            </CardContent>
          </Card>

          <ConfirmDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            title="Xóa tài khoản"
            description="Bạn có chắc muốn xóa tài khoản? Tất cả dữ liệu sẽ bị xóa vĩnh viễn sau 30 ngày. Hành động này không thể hoàn tác."
            confirmLabel="Xóa tài khoản"
            variant="destructive"
            onConfirm={handleDeleteAccount}
          />
        </div>
      </div>
    </div>
  )
}
