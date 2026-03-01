'use client'

import { format } from 'date-fns'

import { cn } from '@/lib/utils'
import type { Message } from '@/types'

interface MessageBubbleProps {
  message: Message
  isMine: boolean
}

export default function MessageBubble({ message, isMine }: MessageBubbleProps) {
  const time = format(new Date(message.created_at), 'HH:mm')

  return (
    <div className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
      <div className="max-w-[75%]">
        <div
          className={cn(
            'rounded-2xl px-4 py-2 text-sm',
            isMine
              ? 'bg-emerald-600 text-white rounded-br-sm'
              : 'bg-gray-100 text-gray-900 rounded-bl-sm'
          )}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        <p
          className={cn(
            'mt-1 text-[11px] text-gray-400',
            isMine ? 'text-right' : 'text-left'
          )}
        >
          {time}
        </p>
      </div>
    </div>
  )
}
