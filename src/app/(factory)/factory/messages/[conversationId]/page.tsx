'use client'

import { useParams } from 'next/navigation'
import MessagesPageContent from '@/components/messages/MessagesPageContent'

export default function FactoryConversationPage() {
  const params = useParams()
  return <MessagesPageContent initialConversationId={params.conversationId as string} />
}
