'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, Banknote, Users, Building2, Bookmark } from 'lucide-react'
import { formatSalaryRange, getDistanceLabel } from '@/lib/geo'
import type { Job } from '@/types'

interface JobCardProps {
  job: Job
  distanceKm?: number
  showApplyButton?: boolean
  onApply?: (jobId: string) => void
  applied?: boolean
  linkPrefix?: string
  isSaved?: boolean
  onToggleSave?: (jobId: string) => void
}

const shiftLabels: Record<string, string> = {
  day: 'Ca ngày',
  night: 'Ca đêm',
  rotating: 'Ca xoay',
  flexible: 'Linh hoạt',
}

export default function JobCard({
  job,
  distanceKm,
  showApplyButton = true,
  onApply,
  applied = false,
  linkPrefix = '/worker/jobs',
  isSaved = false,
  onToggleSave,
}: JobCardProps) {
  const distance = distanceKm ?? job._distance_km
  const distanceInfo = distance !== undefined ? getDistanceLabel(distance) : null

  return (
    <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Company */}
            <div className="flex items-center gap-2 mb-1">
              {job.factory?.logo_url ? (
                <Image src={job.factory.logo_url} alt="" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-amber-700" />
                </div>
              )}
              <span className="text-sm text-gray-500 truncate">
                {job.factory?.company_name || 'Nhà máy'}
              </span>
            </div>

            {/* Title */}
            <Link href={`${linkPrefix}/${job.id}`}>
              <h3 className="font-semibold text-gray-900 hover:text-emerald-600 transition-colors line-clamp-1">
                {job.title}
              </h3>
            </Link>

            {/* Info Row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
              {distance !== undefined && distanceInfo && (
                <span className={`flex items-center gap-1 ${distanceInfo.color} font-medium`}>
                  <MapPin className="h-3.5 w-3.5" />
                  {distance} km
                </span>
              )}
              <span className="flex items-center gap-1">
                <Banknote className="h-3.5 w-3.5" />
                {formatSalaryRange(job.salary_min, job.salary_max)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {shiftLabels[job.shift_type] || job.shift_type}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {job.positions} vị trí
              </span>
            </div>

            {/* Skills */}
            {job.skills_required?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {job.skills_required.slice(0, 4).map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {job.skills_required.length > 4 && (
                  <Badge variant="secondary" className="text-xs">
                    +{job.skills_required.length - 4}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Right side actions */}
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              {/* Bookmark button */}
              {onToggleSave && (
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    onToggleSave(job.id)
                  }}
                  className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                  aria-label={isSaved ? 'Bỏ lưu' : 'Lưu việc làm'}
                >
                  <Bookmark
                    className={`h-5 w-5 ${
                      isSaved
                        ? 'fill-emerald-600 text-emerald-600'
                        : 'text-gray-400 hover:text-emerald-600'
                    }`}
                  />
                </button>
              )}
              {distanceInfo && (
                <span className="text-xs text-gray-400">{distanceInfo.transport}</span>
              )}
            </div>
            {showApplyButton && (
              <>
                {applied ? (
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                    Đã ứng tuyển
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 whitespace-nowrap"
                    onClick={(e) => {
                      e.preventDefault()
                      onApply?.(job.id)
                    }}
                  >
                    Ứng tuyển
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
