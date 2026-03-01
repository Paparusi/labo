import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createPaymentUrl } from '@/lib/vnpay'
import { rateLimit } from '@/lib/rate-limit'

const checkoutSchema = z.object({
  plan_id: z.string().uuid(),
  interval: z.enum(['monthly', 'yearly']),
  amount: z.number().int().positive().max(100_000_000),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { success } = rateLimit(`checkout:${user.id}`, 5, 60_000)
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = checkoutSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
  }

  const { plan_id, interval, amount } = parsed.data

  // Create pending payment record
  const orderId = `VN${Date.now()}`
  const { data: payment, error: payError } = await supabase
    .from('payments')
    .insert({
      factory_id: user.id,
      amount,
      method: 'vnpay',
      transaction_id: orderId,
      status: 'pending',
      vnpay_data: { plan_id, interval },
    })
    .select()
    .single()

  if (payError) {
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }

  // Get plan info
  const { data: plan } = await supabase
    .from('subscription_plans')
    .select('name')
    .eq('id', plan_id)
    .single()

  // Create VNPay URL
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'
  const paymentUrl = createPaymentUrl({
    orderId,
    amount,
    orderInfo: `Labo - Goi ${plan?.name || 'dich vu'} (${interval})`,
    ipAddr: ip.split(',')[0].trim(),
  })

  return NextResponse.json({ payment_url: paymentUrl, payment_id: payment.id })
}
