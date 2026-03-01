'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/layout/Header'
import PricingTable from '@/components/subscription/PricingTable'
import type { User, SubscriptionPlan } from '@/types'

export default function PricingPage() {
  const [user, setUser] = useState<User | null>(null)
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data } = await supabase.from('users').select('*').eq('id', authUser.id).single()
        setUser(data)
      }

      const { data: plansData } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
      if (plansData) setPlans(plansData)
    }
    fetchData()
  }, [supabase])

  const handleSelectPlan = () => {
    if (!user) {
      router.push('/register?role=factory')
    } else {
      router.push('/factory/subscription')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Bang gia dich vu</h1>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            Bat dau voi goi dung thu mien phi 1 thang. Nang cap bat cu luc nao de mo rong pham vi tuyen dung.
          </p>
        </div>
        <PricingTable
          plans={plans}
          onSelectPlan={handleSelectPlan}
          showTrialBanner={!user}
        />
      </div>
    </div>
  )
}
