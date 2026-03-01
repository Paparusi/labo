'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/layout/Header'
import ConversationList from '@/components/messages/ConversationList'
import ChatView from '@/components/messages/ChatView'
import { useConversations, useUnreadMessages } from '@/hooks/useMessages'
import { useNotifications } from '@/hooks/useNotifications'
import { Loader2, MessageSquare } from 'lucide-react'
import type { User } from '@/types'

interface MessagesPageContentProps {
  initialConversationId?: string | null
}

export default function MessagesPageContent({ initialConversationId = null }: MessagesPageContentProps) {
  const [user, setUser] = useState<User | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [activeConversationId, setActiveConversationId] = useState<string | null>(initialConversationId)
  const [pageLoading, setPageLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function fetchUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        router.push('/login')
        return
      }
      const { data } = await supabase.from('users').select('*').eq('id', authUser.id).single()
      if (data) {
        setUser(data)
        setUserId(authUser.id)
      }
      setPageLoading(false)
    }
    fetchUser()
  }, [supabase, router])

  const { conversations, loading: convsLoading } = useConversations(userId)
  const { unreadCount: notifUnread } = useNotifications(userId)
  const { unreadCount: msgUnread } = useUnreadMessages(userId)

  const activeConv = conversations.find(c => c.conversation_id === activeConversationId)

  const handleSelectConversation = (convId: string) => {
    setActiveConversationId(convId)
    if (typeof window !== 'undefined' && window.innerWidth < 768 && user) {
      router.push(`/${user.role}/messages/${convId}`)
    }
  }

  const handleBack = () => {
    setActiveConversationId(null)
    if (typeof window !== 'undefined' && window.innerWidth < 768 && user) {
      router.push(`/${user.role}/messages`)
    }
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={null} />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} unreadNotifications={notifUnread} unreadMessages={msgUnread} />
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Tin nhắn</h1>
        <div className="flex gap-0 md:gap-4 h-[calc(100vh-12rem)] bg-white rounded-xl border overflow-hidden">
          {/* Conversation List - hidden on mobile when a conversation is active */}
          <div className={`w-full md:w-80 lg:w-96 flex-shrink-0 border-r ${activeConversationId && initialConversationId ? 'hidden md:block' : ''}`}>
            <ConversationList
              conversations={conversations}
              activeConversationId={activeConversationId}
              currentUserId={userId!}
              onSelectConversation={handleSelectConversation}
              loading={convsLoading}
            />
          </div>

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col ${!activeConversationId ? 'hidden md:flex' : ''}`}>
            {activeConv && userId ? (
              <ChatView
                conversationId={activeConversationId!}
                currentUserId={userId}
                otherUserName={activeConv.other_user_name}
                otherUserAvatar={activeConv.other_user_avatar}
                otherUserRole={activeConv.other_user_role}
                onBack={initialConversationId ? handleBack : undefined}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 mx-auto mb-3 text-gray-200" />
                  <p className="text-gray-400">Chọn một cuộc trò chuyện để bắt đầu</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
