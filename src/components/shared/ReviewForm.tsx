'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import StarRatingInput from './StarRatingInput'
import { Loader2, CheckCircle2 } from 'lucide-react'

interface ReviewFormProps {
  toUserId: string
  jobId?: string
  onSubmitted?: () => void
}

export default function ReviewForm({ toUserId, jobId, onSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Vui lòng đăng nhập để đánh giá')
        setLoading(false)
        return
      }

      const { error: insertError } = await supabase
        .from('reviews')
        .insert({
          from_user_id: user.id,
          to_user_id: toUserId,
          job_id: jobId || null,
          rating,
          comment: comment.trim() || null,
        })

      if (insertError) {
        throw insertError
      }

      setSuccess(true)
      setComment('')
      setRating(5)

      if (onSubmitted) {
        onSubmitted()
      }

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err) {
      console.error('Error submitting review:', err)
      setError('Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="border-emerald-200 bg-emerald-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">Cảm ơn bạn đã đánh giá!</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-base font-semibold text-gray-900 mb-2 block">
              Đánh giá của bạn
            </Label>
            <StarRatingInput value={rating} onChange={setRating} />
          </div>

          <div>
            <Label htmlFor="comment" className="text-sm font-medium text-gray-700">
              Nhận xét (không bắt buộc)
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn..."
              rows={3}
              className="mt-1"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Đang gửi...
              </>
            ) : (
              'Gửi đánh giá'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
