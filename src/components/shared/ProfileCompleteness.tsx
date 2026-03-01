'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react'
import type { WorkerProfile, FactoryProfile } from '@/types'

interface ProfileCompletenessProps {
  role: 'worker' | 'factory'
  workerProfile?: Partial<WorkerProfile> | null
  factoryProfile?: Partial<FactoryProfile> | null
}

interface Step {
  label: string
  done: boolean
  href: string
}

function buildWorkerSteps(p: Partial<WorkerProfile> | null | undefined): Step[] {
  return [
    { label: 'Thêm họ và tên', done: !!p?.full_name, href: '/worker/profile' },
    { label: 'Thêm ảnh đại diện', done: !!p?.avatar_url, href: '/worker/profile' },
    { label: 'Thêm kỹ năng', done: (p?.skills?.length ?? 0) > 0, href: '/worker/profile' },
    { label: 'Cập nhật vị trí', done: !!p?.latitude && !!p?.longitude, href: '/worker/profile' },
    { label: 'Thêm kinh nghiệm', done: (p?.experience_years ?? 0) > 0, href: '/worker/profile' },
    { label: 'Viết giới thiệu bản thân', done: !!p?.bio, href: '/worker/profile' },
  ]
}

function buildFactorySteps(p: Partial<FactoryProfile> | null | undefined): Step[] {
  return [
    { label: 'Thêm tên công ty', done: !!p?.company_name, href: '/factory/profile' },
    { label: 'Thêm logo công ty', done: !!p?.logo_url, href: '/factory/profile' },
    { label: 'Chọn ngành nghề', done: !!p?.industry, href: '/factory/profile' },
    { label: 'Cập nhật vị trí nhà máy', done: !!p?.latitude && !!p?.longitude, href: '/factory/profile' },
    { label: 'Thêm mô tả công ty', done: !!p?.description, href: '/factory/profile' },
    { label: 'Thêm thông tin liên hệ', done: !!p?.contact_person && !!p?.contact_phone, href: '/factory/profile' },
  ]
}

export default function ProfileCompleteness({ role, workerProfile, factoryProfile }: ProfileCompletenessProps) {
  const steps = useMemo((): Step[] => {
    if (role === 'worker') {
      return buildWorkerSteps(workerProfile)
    }
    return buildFactorySteps(factoryProfile)
  }, [role, workerProfile, factoryProfile])

  const completed = steps.filter(s => s.done).length
  const total = steps.length
  const percentage = Math.round((completed / total) * 100)

  if (percentage === 100) return null

  const nextStep = steps.find(s => !s.done)

  return (
    <Card className="border-emerald-200 bg-emerald-50/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">Hoàn thiện hồ sơ</h3>
          <span className="text-sm font-medium text-emerald-700">{percentage}%</span>
        </div>
        <Progress value={percentage} className="h-2 mb-3" />
        <div className="space-y-1.5">
          {steps.map(step => (
            <div key={step.label} className="flex items-center gap-2 text-sm">
              {step.done ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-gray-300 shrink-0" />
              )}
              <span className={step.done ? 'text-gray-400 line-through' : 'text-gray-700'}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
        {nextStep && (
          <Link
            href={nextStep.href}
            className="mt-3 flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            {nextStep.label} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
