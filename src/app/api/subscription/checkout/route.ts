import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPaymentUrl } from '@/lib/vnpay'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { plan_id, interval, amount } = body

  if (!plan_id || !amount) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

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
