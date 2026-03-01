import { NextRequest, NextResponse } from 'next/server'

import {
  sendEmail,
  welcomeEmail,
  newApplicationEmail,
  applicationStatusEmail,
  newMessageEmail,
} from '@/lib/email'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { type, data } = body

  switch (type) {
    case 'welcome': {
      const { email, name, role } = data
      const template = welcomeEmail(name, role)
      await sendEmail({ to: email, ...template })
      break
    }
    case 'new_application': {
      const { factoryEmail, factoryName, jobTitle, workerName } = data
      const template = newApplicationEmail(factoryName, jobTitle, workerName)
      await sendEmail({ to: factoryEmail, ...template })
      break
    }
    case 'application_status': {
      const { workerEmail, workerName, jobTitle, factoryName, status } = data
      const template = applicationStatusEmail(workerName, jobTitle, factoryName, status)
      await sendEmail({ to: workerEmail, ...template })
      break
    }
    case 'new_message': {
      const { recipientEmail, recipientName, senderName } = data
      const template = newMessageEmail(recipientName, senderName)
      await sendEmail({ to: recipientEmail, ...template })
      break
    }
    default:
      return NextResponse.json({ error: 'Unknown email type' }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
