'use client'

import { useRef, useState } from 'react'
import { Send, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MessageInputProps {
  onSend: (content: string) => Promise<void>
  onTyping: () => void
  disabled?: boolean
}

export default function MessageInput({ onSend, onTyping, disabled = false }: MessageInputProps) {
  const [content, setContent] = useState('')
  const [isSending, setIsSending] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const isDisabled = disabled || isSending
  const canSend = content.trim().length > 0 && !isDisabled

  function resetTextareaHeight(): void {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
    }
  }

  function adjustTextareaHeight(): void {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = 'auto'
    const lineHeight = 24
    const maxHeight = lineHeight * 4
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`
  }

  async function handleSend(): Promise<void> {
    const trimmed = content.trim()
    if (!trimmed || isDisabled) return

    setIsSending(true)
    try {
      await onSend(trimmed)
      setContent('')
      resetTextareaHeight()
    } finally {
      setIsSending(false)
      textareaRef.current?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>): void {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>): void {
    setContent(e.target.value)
    onTyping()
    adjustTextareaHeight()
  }

  return (
    <div className="flex items-end gap-2 border-t bg-white p-3">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Nhập tin nhắn..."
        disabled={isDisabled}
        rows={1}
        className={cn(
          'flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5',
          'text-sm placeholder:text-gray-400',
          'outline-none transition-colors',
          'focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500/20',
          'disabled:cursor-not-allowed disabled:opacity-50'
        )}
      />
      <Button
        type="button"
        size="icon"
        onClick={handleSend}
        disabled={!canSend}
        className={cn(
          'h-10 w-10 shrink-0 rounded-full',
          'bg-emerald-600 hover:bg-emerald-700',
          'disabled:bg-gray-200 disabled:text-gray-400'
        )}
      >
        {isSending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}
