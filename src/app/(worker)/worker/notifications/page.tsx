'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/layout/Header'
import { useNotifications } from '@/hooks/useNotifications'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, CheckCheck, Loader2, Briefcase, CheckCircle2, XCircle, AlertTriangle, MessageSquare } from 'lucide-react'
import type { User, Notification } from '@/types'

const ICON_MAP: Record<string, typeof Bell> = {
  new_job_nearby: Briefcase,
  application_accepted: CheckCircle2,
  application_rejected: XCircle,
  trial_expiring: AlertTriangle,
  new_message: MessageSquare,
}

function getNotificationHref(n: Notification): string | null {
  const data = n.data as Record<string, unknown> | null
  switch (n.type) {
    case 'new_job_nearby':
      return data?.job_id ? `/worker/jobs/${data.job_id}` : '/worker/jobs'
    case 'application_accepted':
    case 'application_rejected':
      return '/worker/applications'
    case 'new_message':
      return data?.conversation_id ? `/worker/messages/${data.conversation_id}` : '/worker/messages'
    default:
      return null
  }
}

export default function NotificationsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data } = await supabase.from('users').select('*').eq('id', authUser.id).single()
        setUser(data)
        setUserId(authUser.id)
      }
      setLoading(false)
    }
    fetchUser()
  }, [supabase])

  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications(userId)

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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Thông báo</h1>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllRead}>
              <CheckCheck className="h-4 w-4 mr-2" />Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Chưa có thông báo nào</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n: Notification) => {
              const Icon = ICON_MAP[n.type] || Bell
              return (
                <Card
                  key={n.id}
                  className={`cursor-pointer transition-colors ${!n.is_read ? 'bg-emerald-50 border-emerald-200' : ''}`}
                  onClick={() => {
                    if (!n.is_read) markAsRead(n.id)
                    const href = getNotificationHref(n)
                    if (href) router.push(href)
                  }}
                >
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${!n.is_read ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                      <Icon className={`h-5 w-5 ${!n.is_read ? 'text-emerald-600' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-medium text-sm ${!n.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                          {n.title}
                        </h3>
                        {!n.is_read && <Badge className="bg-emerald-600 text-white text-[10px] px-1.5 py-0">Mới</Badge>}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(n.created_at).toLocaleDateString('vi-VN')} {new Date(n.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
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
