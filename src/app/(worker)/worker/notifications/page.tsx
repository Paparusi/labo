'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

import Header from '@/components/layout/Header'
import { useNotifications } from '@/hooks/useNotifications'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Bell, CheckCheck, Briefcase, CheckCircle2, XCircle, AlertTriangle, MessageSquare, Trash2, Settings } from 'lucide-react'
import type { Notification } from '@/types'

const ICON_MAP: Record<string, typeof Bell> = {
  new_job_nearby: Briefcase,
  application_accepted: CheckCircle2,
  application_rejected: XCircle,
  trial_expiring: AlertTriangle,
  new_message: MessageSquare,
}

const TYPE_LABELS: Record<string, string> = {
  new_job_nearby: 'Việc mới',
  application_accepted: 'Chấp nhận',
  application_rejected: 'Từ chối',
  new_message: 'Tin nhắn',
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
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchUserId() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) setUserId(authUser.id)
    }
    fetchUserId()
  }, [supabase])

  const { notifications, unreadCount, markAsRead, markAllRead, deleteNotification } = useNotifications(userId)

  const unread = notifications.filter(n => !n.is_read)

  const renderNotification = (n: Notification) => {
    const Icon = ICON_MAP[n.type] || Bell
    return (
      <Card
        key={n.id}
        className={`transition-colors ${!n.is_read ? 'bg-emerald-50 border-emerald-200' : ''}`}
      >
        <CardContent className="p-4 flex items-start gap-3">
          <div
            className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer ${!n.is_read ? 'bg-emerald-100' : 'bg-gray-100'}`}
            onClick={() => {
              if (!n.is_read) markAsRead(n.id)
              const href = getNotificationHref(n)
              if (href) router.push(href)
            }}
          >
            <Icon className={`h-5 w-5 ${!n.is_read ? 'text-emerald-600' : 'text-gray-400'}`} />
          </div>
          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => {
              if (!n.is_read) markAsRead(n.id)
              const href = getNotificationHref(n)
              if (href) router.push(href)
            }}
          >
            <div className="flex items-center gap-2">
              <h3 className={`font-medium text-sm ${!n.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                {n.title}
              </h3>
              {!n.is_read && <Badge className="bg-emerald-600 text-white text-[10px] px-1.5 py-0">Mới</Badge>}
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-gray-400">
                {new Date(n.created_at).toLocaleDateString('vi-VN')} {new Date(n.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </p>
              {TYPE_LABELS[n.type] && (
                <Badge variant="outline" className="text-[10px] py-0">{TYPE_LABELS[n.type]}</Badge>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-red-500 shrink-0"
            onClick={(e) => { e.stopPropagation(); deleteNotification(n.id) }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-6 max-w-2xl animate-fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Thông báo</h1>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllRead}>
                <CheckCheck className="h-4 w-4 mr-2" />Đọc tất cả
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => router.push('/worker/settings')}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">Tất cả ({notifications.length})</TabsTrigger>
            <TabsTrigger value="unread">Chưa đọc ({unreadCount})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-2">
            {notifications.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Chưa có thông báo nào</p>
              </div>
            ) : notifications.map(renderNotification)}
          </TabsContent>

          <TabsContent value="unread" className="space-y-2">
            {unread.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <CheckCheck className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Đã đọc tất cả thông báo</p>
              </div>
            ) : unread.map(renderNotification)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
