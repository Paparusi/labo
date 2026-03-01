import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import {
  sendEmail,
  welcomeEmail,
  newApplicationEmail,
  applicationStatusEmail,
  newMessageEmail,
} from '@/lib/email'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'

const welcomeSchema = z.object({
  type: z.literal('welcome'),
  data: z.object({
    email: z.string().email(),
    name: z.string().min(1).max(200),
    role: z.enum(['worker', 'factory']),
  }),
})

const newApplicationSchema = z.object({
  type: z.literal('new_application'),
  data: z.object({
    factoryEmail: z.string().email(),
    factoryName: z.string().min(1).max(200),
    jobTitle: z.string().min(1).max(200),
    workerName: z.string().min(1).max(200),
  }),
})

const applicationStatusSchema = z.object({
  type: z.literal('application_status'),
  data: z.object({
    workerEmail: z.string().email(),
    workerName: z.string().min(1).max(200),
    jobTitle: z.string().min(1).max(200),
    factoryName: z.string().min(1).max(200),
    status: z.enum(['accepted', 'rejected']),
  }),
})

const newMessageSchema = z.object({
  type: z.literal('new_message'),
  data: z.object({
    recipientEmail: z.string().email(),
    recipientName: z.string().min(1).max(200),
    senderName: z.string().min(1).max(200),
  }),
})

const emailRequestSchema = z.discriminatedUnion('type', [
  welcomeSchema,
  newApplicationSchema,
  applicationStatusSchema,
  newMessageSchema,
])

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { success } = rateLimit(`email:${user.id}`, 10, 60_000)
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = emailRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
  }

  const { type, data } = parsed.data

  switch (type) {
    case 'welcome': {
      const template = welcomeEmail(data.name, data.role)
      await sendEmail({ to: data.email, ...template })
      break
    }
    case 'new_application': {
      const template = newApplicationEmail(data.factoryName, data.jobTitle, data.workerName)
      await sendEmail({ to: data.factoryEmail, ...template })
      break
    }
    case 'application_status': {
      const template = applicationStatusEmail(data.workerName, data.jobTitle, data.factoryName, data.status)
      await sendEmail({ to: data.workerEmail, ...template })
      break
    }
    case 'new_message': {
      const template = newMessageEmail(data.recipientName, data.senderName)
      await sendEmail({ to: data.recipientEmail, ...template })
      break
    }
  }

  return NextResponse.json({ success: true })
}
