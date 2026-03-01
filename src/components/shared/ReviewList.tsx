'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import StarRating from './StarRating'
import { Loader2, MessageSquare } from 'lucide-react'

interface ReviewData {
  id: string
  rating: number
  comment: string | null
  created_at: string
  reviewer_name: string
  reviewer_role: 'worker' | 'factory'
  reviewer_avatar: string | null
}

interface ReviewListProps {
  userId: string
}

export default function ReviewList({ userId }: ReviewListProps) {
  const [reviews, setReviews] = useState<ReviewData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    async function fetchReviews() {
      setLoading(true)
      setError(null)

      try {
        const { data, error: rpcError } = await supabase
          .rpc('get_user_reviews', {
            p_user_id: userId,
            p_limit: 50
          })

        if (rpcError) {
          throw rpcError
        }

        setReviews(data || [])
      } catch (err) {
        console.error('Error fetching reviews:', err)
        setError('Không thể tải đánh giá')
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [userId, supabase])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60))
        return diffMinutes <= 1 ? 'Vừa xong' : `${diffMinutes} phút trước`
      }
      return `${diffHours} giờ trước`
    } else if (diffDays === 1) {
      return 'Hôm qua'
    } else if (diffDays < 7) {
      return `${diffDays} ngày trước`
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7)
      return `${weeks} tuần trước`
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return `${months} tháng trước`
    } else {
      return date.toLocaleDateString('vi-VN')
    }
  }

  const getRoleBadge = (role: 'worker' | 'factory') => {
    if (role === 'worker') {
      return (
        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
          Công nhân
        </Badge>
      )
    }
    return (
      <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
        Nhà máy
      </Badge>
    )
  }

  const getInitials = (name: string) => {
    const words = name.trim().split(' ')
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase()
    }
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Đang tải đánh giá...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        {error}
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-8">
          <div className="text-center text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">Chưa có đánh giá</p>
            <p className="text-sm mt-1">Đánh giá sẽ hiển thị tại đây</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <Card key={review.id} className="border-gray-200">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={review.reviewer_avatar || undefined} />
                <AvatarFallback className="bg-emerald-100 text-emerald-700 font-medium">
                  {getInitials(review.reviewer_name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900">
                      {review.reviewer_name}
                    </span>
                    {getRoleBadge(review.reviewer_role)}
                  </div>
                  <span className="text-xs text-gray-500 shrink-0">
                    {formatDate(review.created_at)}
                  </span>
                </div>

                <div className="mb-2">
                  <StarRating rating={review.rating} size="sm" />
                </div>

                {review.comment && (
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {review.comment}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
