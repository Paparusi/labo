'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Check, X, Sparkles } from 'lucide-react'
import { formatPrice, getPlanColor } from '@/lib/subscription'
import type { SubscriptionPlan } from '@/types'

interface PricingTableProps {
  plans: SubscriptionPlan[]
  currentPlanSlug?: string | null
  onSelectPlan?: (plan: SubscriptionPlan, interval: 'monthly' | 'yearly') => void
  showTrialBanner?: boolean
}

export default function PricingTable({
  plans,
  currentPlanSlug,
  onSelectPlan,
  showTrialBanner = true,
}: PricingTableProps) {
  const [isYearly, setIsYearly] = useState(false)

  const sortedPlans = [...plans].sort((a, b) => a.sort_order - b.sort_order)

  return (
    <div className="w-full">
      {/* Trial Banner */}
      {showTrialBanner && !currentPlanSlug && (
        <div className="mb-8 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white text-center">
          <Sparkles className="h-8 w-8 mx-auto mb-2" />
          <h3 className="text-xl font-bold">Dùng thử miễn phí 1 tháng</h3>
          <p className="mt-1 text-emerald-100">
            Đăng ký ngay để trải nghiệm tất cả tính năng. Không cần thẻ tín dụng.
          </p>
        </div>
      )}

      {/* Toggle Monthly/Yearly */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <span className={`text-sm font-medium ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
          Theo tháng
        </span>
        <Switch checked={isYearly} onCheckedChange={setIsYearly} />
        <span className={`text-sm font-medium ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
          Theo năm
        </span>
        {isYearly && (
          <Badge className="bg-emerald-100 text-emerald-700 ml-2">
            Tiết kiệm 17%
          </Badge>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sortedPlans.map((plan) => {
          const isCurrent = currentPlanSlug === plan.slug
          const isPro = plan.slug === 'pro'
          const price = isYearly ? plan.price_yearly : plan.price_monthly

          return (
            <Card
              key={plan.id}
              className={`relative ${getPlanColor(plan.slug)} ${isPro ? 'ring-2 ring-emerald-500 shadow-lg scale-105' : ''} ${isCurrent ? 'ring-2 ring-blue-500' : ''}`}
            >
              {isPro && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-emerald-600 text-white px-4">
                    Phổ biến nhất
                  </Badge>
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-4">
                    Gói hiện tại
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="mt-3">
                  <span className="text-3xl font-bold">
                    {price === 0 ? 'Miễn phí' : formatPrice(price)}
                  </span>
                  {price > 0 && (
                    <span className="text-sm text-gray-500">
                      /{isYearly ? 'năm' : 'tháng'}
                    </span>
                  )}
                </div>
                {plan.slug === 'trial' && (
                  <p className="text-sm text-gray-500 mt-1">1 tháng dùng thử</p>
                )}
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-3">
                  <PlanFeature
                    label="Số tin tuyển"
                    value={plan.max_job_posts === -1 ? 'Không giới hạn' : `${plan.max_job_posts} tin`}
                    available
                  />
                  <PlanFeature
                    label="Xem hồ sơ"
                    value={plan.max_view_profiles === -1 ? 'Không giới hạn' : `${plan.max_view_profiles} hồ sơ`}
                    available
                  />
                  <PlanFeature
                    label="Bán kính tìm kiếm"
                    value={`${plan.radius_km} km`}
                    available
                  />
                  <PlanFeature
                    label="Phân tích dữ liệu"
                    available={plan.features?.analytics ?? false}
                  />
                  <PlanFeature
                    label="Truy cập API"
                    available={plan.features?.api_access ?? false}
                  />
                  <PlanFeature
                    label="Hỗ trợ ưu tiên"
                    available={plan.features?.priority_support ?? false}
                  />
                </ul>

                <Button
                  className={`w-full mt-6 ${
                    isPro
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : isCurrent
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                  disabled={isCurrent}
                  onClick={() => onSelectPlan?.(plan, isYearly ? 'yearly' : 'monthly')}
                >
                  {isCurrent ? 'Gói hiện tại' : plan.slug === 'trial' ? 'Bắt đầu dùng thử' : 'Chọn gói này'}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function PlanFeature({
  label,
  value,
  available = true,
}: {
  label: string
  value?: string
  available?: boolean
}) {
  return (
    <li className="flex items-center gap-2 text-sm">
      {available ? (
        <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
      ) : (
        <X className="h-4 w-4 text-gray-300 flex-shrink-0" />
      )}
      <span className={available ? 'text-gray-700' : 'text-gray-400'}>
        {label}
        {value && <span className="font-medium ml-1">({value})</span>}
      </span>
    </li>
  )
}
