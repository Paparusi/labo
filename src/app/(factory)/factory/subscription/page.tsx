'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/layout/Header'
import PricingTable from '@/components/subscription/PricingTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, Crown, Calendar, AlertTriangle } from 'lucide-react'
import { isSubscriptionActive, getTrialDaysLeft, formatPrice, getPlanBadgeColor } from '@/lib/subscription'
import type { Subscription, SubscriptionPlan } from '@/types'

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null)
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [payments, setPayments] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      // Plans
      const { data: plansData } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
      if (plansData) setPlans(plansData)

      // Current subscription
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*, subscription_plans(*)')
        .eq('factory_id', authUser.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (subData) {
        setSubscription(subData)
        setCurrentPlan(subData.subscription_plans)
      }

      // Payment history
      const { data: payData } = await supabase
        .from('payments')
        .select('*')
        .eq('factory_id', authUser.id)
        .order('created_at', { ascending: false })
        .limit(10)
      if (payData) setPayments(payData)

      setLoading(false)
    }
    fetchData()
  }, [supabase])

  const handleSelectPlan = async (plan: SubscriptionPlan, interval: 'monthly' | 'yearly') => {
    if (plan.slug === 'trial') return

    const amount = interval === 'yearly' ? plan.price_yearly : plan.price_monthly

    // Create payment via VNPay
    const res = await fetch('/api/subscription/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan_id: plan.id,
        interval,
        amount,
      }),
    })

    const data = await res.json()
    if (data.payment_url) {
      window.location.href = data.payment_url
    }
  }

  const trialDays = getTrialDaysLeft(subscription)
  const isActive = isSubscriptionActive(subscription)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Goi dich vu</h1>

        {/* Current Plan Info */}
        {subscription && currentPlan && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Crown className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">Goi {currentPlan.name}</h3>
                      <Badge className={getPlanBadgeColor(currentPlan.slug)}>
                        {subscription.status === 'trial' ? 'Dung thu' :
                         subscription.status === 'active' ? 'Dang hoat dong' :
                         subscription.status === 'expired' ? 'Het han' : 'Da huy'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        Het han: {new Date(subscription.end_date).toLocaleDateString('vi-VN')}
                      </span>
                      {subscription.status === 'trial' && trialDays > 0 && (
                        <span className="flex items-center gap-1 text-amber-600">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Con {trialDays} ngay dung thu
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Gioi han hien tai</p>
                  <p className="text-sm">{currentPlan.max_job_posts === -1 ? 'Khong gioi han' : `${currentPlan.max_job_posts} tin tuyen`} | {currentPlan.radius_km}km</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pricing Table */}
        <PricingTable
          plans={plans}
          currentPlanSlug={currentPlan?.slug}
          onSelectPlan={handleSelectPlan}
          showTrialBanner={!subscription}
        />

        {/* Payment History */}
        {payments.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">Lich su thanh toan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {payments.map((p: Record<string, unknown>) => (
                  <div key={p.id as string} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div>
                      <p className="font-medium text-sm">{formatPrice(p.amount as number)}</p>
                      <p className="text-xs text-gray-500">{new Date(p.created_at as string).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <Badge className={
                      p.status === 'success' ? 'bg-green-100 text-green-700' :
                      p.status === 'failed' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }>
                      {p.status === 'success' ? 'Thanh cong' : p.status === 'failed' ? 'That bai' : 'Cho xu ly'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
