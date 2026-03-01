'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  AlertDialog,
  AlertDialogContent,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { MapPin, Briefcase, MessageSquare, Star, ArrowRight, CheckCircle2 } from 'lucide-react'

const WORKER_STEPS = [
  {
    title: 'Chào mừng đến với Labo!',
    description: 'Nền tảng kết nối công nhân với nhà máy gần bạn. Hãy cùng khám phá những gì Labo mang lại.',
    icon: MapPin,
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    title: 'Tìm việc dễ dàng',
    description: 'Xem bản đồ việc làm gần bạn, lọc theo ngành nghề, lương, ca làm. Ứng tuyển chỉ với một nút bấm.',
    icon: Briefcase,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    title: 'Kết nối trực tiếp',
    description: 'Nhắn tin trực tiếp với nhà máy, nhận thông báo khi đơn ứng tuyển được xử lý.',
    icon: MessageSquare,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    title: 'Hoàn thiện hồ sơ',
    description: 'Cập nhật kỹ năng, kinh nghiệm và vị trí để nhà máy dễ dàng tìm thấy bạn. Bắt đầu ngay!',
    icon: CheckCircle2,
    color: 'bg-amber-100 text-amber-600',
  },
]

const FACTORY_STEPS = [
  {
    title: 'Chào mừng đến với Labo!',
    description: 'Nền tảng tuyển dụng thông minh giúp bạn tìm công nhân phù hợp trong khu vực.',
    icon: MapPin,
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    title: 'Đăng tin tuyển dụng',
    description: 'Tạo tin tuyển dụng với thông tin chi tiết. Công nhân gần nhà máy sẽ nhìn thấy ngay.',
    icon: Briefcase,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    title: 'Tìm kiếm & Liên hệ',
    description: 'Duyệt hồ sơ công nhân gần đây, xem kỹ năng và kinh nghiệm, nhắn tin trực tiếp.',
    icon: MessageSquare,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    title: 'Đánh giá & Phát triển',
    description: 'Đánh giá công nhân, xây dựng uy tín nhà máy. Hoàn thiện hồ sơ công ty để bắt đầu!',
    icon: Star,
    color: 'bg-amber-100 text-amber-600',
  },
]

interface OnboardingModalProps {
  role: 'worker' | 'factory'
}

export default function OnboardingModal({ role }: OnboardingModalProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const supabase = createClient()
  const steps = role === 'worker' ? WORKER_STEPS : FACTORY_STEPS

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('users')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single()
      if (data && !data.onboarding_completed) {
        setOpen(true)
      }
    }
    check()
  }, [supabase])

  const handleComplete = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('users').update({ onboarding_completed: true }).eq('id', user.id)
    }
    setOpen(false)
  }

  const currentStep = steps[step]
  const Icon = currentStep.icon
  const isLast = step === steps.length - 1

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="max-w-md">
        <div className="text-center py-2">
          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 mb-6">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? 'w-6 bg-emerald-600' : i < step ? 'w-1.5 bg-emerald-300' : 'w-1.5 bg-gray-200'
                }`}
              />
            ))}
          </div>

          <div className={`h-16 w-16 rounded-2xl ${currentStep.color} flex items-center justify-center mx-auto mb-4`}>
            <Icon className="h-8 w-8" />
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">{currentStep.title}</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-8">{currentStep.description}</p>

          <div className="flex gap-3">
            {step > 0 && (
              <Button variant="outline" className="flex-1" onClick={() => setStep(s => s - 1)}>
                Quay lại
              </Button>
            )}
            {isLast ? (
              <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={handleComplete}>
                <CheckCircle2 className="h-4 w-4 mr-2" />Bắt đầu ngay
              </Button>
            ) : (
              <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => setStep(s => s + 1)}>
                Tiếp theo <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>

          {!isLast && (
            <button
              className="text-xs text-gray-400 hover:text-gray-600 mt-3 underline"
              onClick={handleComplete}
            >
              Bỏ qua
            </button>
          )}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
