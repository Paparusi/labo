'use client'

import { useEffect, useRef } from 'react'
import { format, isToday, isYesterday } from 'date-fns'
import { vi } from 'date-fns/locale/vi'
import { ArrowLeft, Building2, User, Loader2 } from 'lucide-react'

import { useChat } from '@/hooks/useMessages'
import { Badge } from '@/components/ui/badge'
import type { UserRole, Message } from '@/types'

import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'

interface ChatViewProps {
  conversationId: string
  currentUserId: string
  otherUserName: string
  otherUserAvatar: string | null
  otherUserRole: UserRole
  onBack?: () => void
}

const roleLabels: Record<UserRole, string> = {
  factory: 'Nhà máy',
  worker: 'Công nhân',
  admin: 'Admin',
}

function formatDateSeparator(dateStr: string): string {
  const date = new Date(dateStr)

  if (isToday(date)) return 'Hôm nay'
  if (isYesterday(date)) return 'Hôm qua'

  return format(date, 'dd/MM/yyyy', { locale: vi })
}

function isSameDay(a: string, b: string): boolean {
  const dateA = new Date(a)
  const dateB = new Date(b)
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  )
}

function getRoleBadgeClasses(role: UserRole): string {
  if (role === 'factory') {
    return 'bg-emerald-100 text-emerald-700'
  }
  return 'bg-blue-100 text-blue-700'
}

export default function ChatView({
  conversationId,
  currentUserId,
  otherUserName,
  otherUserRole,
  onBack,
}: ChatViewProps) {
  const {
    messages,
    loading,
    sendMessage,
    markAsRead,
    loadMore,
    hasMore,
    isOtherTyping,
    sendTyping,
  } = useChat(conversationId, currentUserId)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Mark messages as read when conversation opens
  useEffect(() => {
    markAsRead()
  }, [markAsRead])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  function renderAvatar(): React.ReactNode {
    if (otherUserRole === 'factory') {
      return (
        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
          <Building2 className="h-5 w-5 text-emerald-700" />
        </div>
      )
    }

    return (
      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
        <User className="h-5 w-5 text-blue-700" />
      </div>
    )
  }

  function renderDateSeparator(dateStr: string): React.ReactNode {
    return (
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 whitespace-nowrap">
          {formatDateSeparator(dateStr)}
        </span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
    )
  }

  function renderMessages(): React.ReactNode {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      )
    }

    if (messages.length === 0) {
      return (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-gray-400">
            Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
          </p>
        </div>
      )
    }

    const elements: React.ReactNode[] = []

    messages.forEach((message: Message, index: number) => {
      const showDateSeparator =
        index === 0 || !isSameDay(messages[index - 1].created_at, message.created_at)

      if (showDateSeparator) {
        elements.push(
          <div key={`date-${message.created_at}`}>
            {renderDateSeparator(message.created_at)}
          </div>
        )
      }

      elements.push(
        <MessageBubble
          key={message.id}
          message={message}
          isMine={message.sender_id === currentUserId}
        />
      )
    })

    return elements
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b bg-white px-4 py-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="p-1 -ml-1 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Quay lại"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
        )}

        {renderAvatar()}

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-gray-900 truncate">{otherUserName}</h2>
        </div>

        <Badge variant="secondary" className={getRoleBadgeClasses(otherUserRole)}>
          {roleLabels[otherUserRole]}
        </Badge>
      </div>

      {/* Messages area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4"
      >
        {hasMore && !loading && (
          <div className="flex justify-center mb-4">
            <button
              type="button"
              onClick={loadMore}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
            >
              Tải thêm tin nhắn
            </button>
          </div>
        )}

        <div className="space-y-2">
          {renderMessages()}
        </div>

        {/* Typing indicator */}
        {isOtherTyping && (
          <div className="flex items-center gap-1 mt-2 ml-1">
            <span className="text-sm text-gray-400 italic">Đang nhập...</span>
            <span className="flex gap-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t">
        <MessageInput onSend={sendMessage} onTyping={sendTyping} />
      </div>
    </div>
  )
}
