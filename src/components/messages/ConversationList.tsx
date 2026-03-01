'use client'

import { useState } from 'react'
import { Search, Building2, User, MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale/vi'

import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { ConversationWithDetails } from '@/types'

interface ConversationListProps {
  conversations: ConversationWithDetails[]
  activeConversationId?: string | null
  currentUserId: string
  onSelectConversation: (conversationId: string) => void
  loading: boolean
}

function LoadingSkeleton(): React.ReactElement {
  return (
    <div className="space-y-1 p-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg p-3">
          <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState(): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <MessageSquare className="h-12 w-12 text-gray-300" />
      <p className="mt-3 text-sm text-gray-500">
        Chưa có cuộc trò chuyện nào
      </p>
    </div>
  )
}

function getLastMessagePreview(
  conversation: ConversationWithDetails,
  currentUserId: string
): string {
  if (!conversation.last_message_content) {
    return 'Chưa có tin nhắn'
  }

  const prefix = conversation.last_message_sender_id === currentUserId ? 'Bạn: ' : ''
  return prefix + conversation.last_message_content
}

function getTimeLabel(dateString: string | null): string {
  if (!dateString) return ''
  return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: vi })
}

export default function ConversationList({
  conversations,
  activeConversationId,
  currentUserId,
  onSelectConversation,
  loading,
}: ConversationListProps): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredConversations = conversations.filter((conversation) =>
    conversation.other_user_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex h-full flex-col">
      {/* Search */}
      <div className="border-b p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Tìm cuộc trò chuyện..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Conversation list */}
      <ScrollArea className="flex-1">
        {loading ? (
          <LoadingSkeleton />
        ) : filteredConversations.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-0.5 p-2">
            {filteredConversations.map((conversation) => {
              const isActive = conversation.conversation_id === activeConversationId
              const isFactory = conversation.other_user_role === 'factory'

              return (
                <div
                  key={conversation.conversation_id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectConversation(conversation.conversation_id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onSelectConversation(conversation.conversation_id)
                    }
                  }}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors',
                    isActive
                      ? 'border-l-2 border-emerald-600 bg-emerald-50'
                      : 'hover:bg-gray-50'
                  )}
                >
                  {/* Avatar */}
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                      isFactory
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-blue-100 text-blue-700'
                    )}
                  >
                    {isFactory ? (
                      <Building2 className="h-5 w-5" />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-medium text-gray-900">
                        {conversation.other_user_name}
                      </p>
                      {conversation.last_message_at && (
                        <span className="shrink-0 text-xs text-gray-400">
                          {getTimeLabel(conversation.last_message_at)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm text-gray-500">
                        {getLastMessagePreview(conversation, currentUserId)}
                      </p>
                      {conversation.unread_count > 0 && (
                        <Badge className="shrink-0 bg-red-500 text-white hover:bg-red-500">
                          {conversation.unread_count}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
