'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Message, ConversationWithDetails } from '@/types'

const PAGE_SIZE = 50

// ==================== useConversations ====================
export function useConversations(userId: string | null) {
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([])
  const [totalUnread, setTotalUnread] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchConversations = useCallback(async () => {
    if (!userId) return
    const { data } = await supabase.rpc('get_user_conversations', { p_user_id: userId })
    if (data) {
      const convs = data as ConversationWithDetails[]
      setConversations(convs)
      setTotalUnread(convs.reduce((sum, c) => sum + (c.unread_count || 0), 0))
    }
    setLoading(false)
  }, [userId, supabase])

  useEffect(() => {
    fetchConversations()
    if (!userId) return

    const channel = supabase
      .channel('user-new-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`,
        },
        (payload) => {
          const msg = payload.new as Message
          setConversations(prev => {
            const idx = prev.findIndex(c => c.conversation_id === msg.conversation_id)
            if (idx >= 0) {
              const updated = [...prev]
              updated[idx] = {
                ...updated[idx],
                last_message_content: msg.content,
                last_message_sender_id: msg.sender_id,
                last_message_at: msg.created_at,
                unread_count: updated[idx].unread_count + 1,
              }
              const [item] = updated.splice(idx, 1)
              updated.unshift(item)
              return updated
            }
            // New conversation - refetch
            fetchConversations()
            return prev
          })
          setTotalUnread(prev => prev + 1)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, fetchConversations, supabase])

  return { conversations, totalUnread, loading, refresh: fetchConversations }
}

// ==================== useChat ====================
export function useChat(conversationId: string | null, userId: string | null) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [isOtherTyping, setIsOtherTyping] = useState(false)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const typingThrottleRef = useRef<number>(0)
  const supabase = createClient()

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return
    setLoading(true)
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE)

    if (data) {
      setMessages(data.reverse())
      setHasMore(data.length === PAGE_SIZE)
    }
    setLoading(false)
  }, [conversationId, supabase])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  // Realtime messages
  useEffect(() => {
    if (!conversationId) return

    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message
          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, supabase])

  // Typing indicator
  useEffect(() => {
    if (!conversationId || !userId) return

    const channel = supabase.channel(`typing:${conversationId}`)
    channel
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload?.userId !== userId) {
          setIsOtherTyping(true)
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
          typingTimeoutRef.current = setTimeout(() => setIsOtherTyping(false), 3000)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    }
  }, [conversationId, userId, supabase])

  const sendMessage = useCallback(async (content: string) => {
    if (!conversationId || !userId || !content.trim()) return

    const { data: conv } = await supabase
      .from('conversations')
      .select('participant_1, participant_2')
      .eq('id', conversationId)
      .single()
    if (!conv) return

    const receiverId = conv.participant_1 === userId ? conv.participant_2 : conv.participant_1

    await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: userId,
      receiver_id: receiverId,
      content: content.trim(),
    })
  }, [conversationId, userId, supabase])

  const markAsRead = useCallback(async () => {
    if (!conversationId || !userId) return
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('is_read', false)
  }, [conversationId, userId, supabase])

  const loadMore = useCallback(async (): Promise<boolean> => {
    if (!conversationId || messages.length === 0) return false
    const oldestMsg = messages[0]
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .lt('created_at', oldestMsg.created_at)
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE)

    if (data && data.length > 0) {
      setMessages(prev => [...data.reverse(), ...prev])
      setHasMore(data.length === PAGE_SIZE)
      return true
    }
    setHasMore(false)
    return false
  }, [conversationId, messages, supabase])

  const sendTyping = useCallback(() => {
    if (!conversationId || !userId) return
    const now = Date.now()
    if (now - typingThrottleRef.current < 500) return
    typingThrottleRef.current = now
    supabase.channel(`typing:${conversationId}`).send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId },
    })
  }, [conversationId, userId, supabase])

  return { messages, loading, sendMessage, markAsRead, loadMore, hasMore, isOtherTyping, sendTyping }
}

// ==================== useUnreadMessages ====================
export function useUnreadMessages(userId: string | null) {
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return

    supabase.rpc('get_unread_message_count', { p_user_id: userId }).then(({ data }) => {
      if (data !== null) setUnreadCount(Number(data))
    })

    const channel = supabase
      .channel('unread-msg-count')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`,
        },
        () => {
          setUnreadCount(prev => prev + 1)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  const decrement = useCallback((count: number = 1) => {
    setUnreadCount(prev => Math.max(0, prev - count))
  }, [])

  return { unreadCount, decrement }
}
