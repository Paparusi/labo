import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verifyReturnUrl } from '@/lib/vnpay'

export async function GET(request: NextRequest) {
  const query: Record<string, string> = {}
  request.nextUrl.searchParams.forEach((value, key) => {
    query[key] = value
  })

  const { isValid, responseCode, txnRef } = verifyReturnUrl(query)

  const supabase = await createServiceClient()

  if (!isValid) {
    return NextResponse.redirect(new URL('/factory/subscription?error=invalid', request.url))
  }

  // Find payment by transaction_id
  const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('transaction_id', txnRef)
    .single()

  if (!payment) {
    return NextResponse.redirect(new URL('/factory/subscription?error=notfound', request.url))
  }

  if (responseCode === '00') {
    // Payment success
    await supabase
      .from('payments')
      .update({ status: 'success', vnpay_data: query })
      .eq('id', payment.id)

    // Activate subscription
    const vnpayData = payment.vnpay_data as { plan_id: string; interval: string }
    const now = new Date()
    const interval = vnpayData?.interval || 'monthly'
    const endDate = new Date(now)
    if (interval === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1)
    } else {
      endDate.setMonth(endDate.getMonth() + 1)
    }

    // Deactivate old subscription
    await supabase
      .from('subscriptions')
      .update({ status: 'expired' })
      .eq('factory_id', payment.factory_id)
      .in('status', ['trial', 'active'])

    // Create new subscription
    await supabase.from('subscriptions').insert({
      factory_id: payment.factory_id,
      plan_id: vnpayData?.plan_id,
      status: 'active',
      start_date: now.toISOString(),
      end_date: endDate.toISOString(),
    })

    return NextResponse.redirect(new URL('/factory/subscription?success=true', request.url))
  } else {
    // Payment failed
    await supabase
      .from('payments')
      .update({ status: 'failed', vnpay_data: query })
      .eq('id', payment.id)

    return NextResponse.redirect(new URL('/factory/subscription?error=failed', request.url))
  }
}
