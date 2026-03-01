'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  size?: 'sm' | 'md'
  showValue?: boolean
  count?: number
}

export default function StarRating({
  rating,
  size = 'md',
  showValue = false,
  count
}: StarRatingProps) {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const starValue = i + 1
    const isFilled = rating >= starValue
    const isHalf = !isFilled && rating >= starValue - 0.5

    return { isFilled, isHalf, key: i }
  })

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {stars.map(({ isFilled, isHalf, key }) => (
          <div key={key} className="relative">
            {isHalf ? (
              <>
                {/* Gray background star */}
                <Star
                  className={cn(sizeClasses[size], 'text-gray-300 absolute')}
                />
                {/* Yellow half star overlay */}
                <Star
                  className={cn(sizeClasses[size], 'text-yellow-400 fill-yellow-400')}
                  style={{
                    clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)',
                  }}
                />
              </>
            ) : (
              <Star
                className={cn(
                  sizeClasses[size],
                  isFilled
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                )}
              />
            )}
          </div>
        ))}
      </div>
      {showValue && (
        <span className={cn(
          'font-medium text-gray-700',
          size === 'sm' ? 'text-sm' : 'text-base'
        )}>
          {rating.toFixed(1)}
          {count !== undefined && (
            <span className="text-gray-500 ml-1">({count})</span>
          )}
        </span>
      )}
    </div>
  )
}
