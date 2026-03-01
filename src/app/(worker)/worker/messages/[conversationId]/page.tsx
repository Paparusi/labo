'use client'

import { useParams } from 'next/navigation'
import MessagesPageContent from '@/components/messages/MessagesPageContent'

export default function WorkerConversationPage() {
  const params = useParams()
  return <MessagesPageContent initialConversationId={params.conversationId as string} />
}
