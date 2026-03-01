'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Star, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import StarRating from '@/components/shared/StarRating'

const REVIEWS_PER_PAGE = 20

interface ReviewWithUsers {
  id: string
  from_user_id: string
  to_user_id: string
  job_id: string | null
  rating: number
  comment: string | null
  created_at: string
  from_user_name: string | null
  to_user_name: string | null
  from_user_role: string | null
  to_user_role: string | null
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewWithUsers[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [ratingFilter, setRatingFilter] = useState('all')
  const supabase = createClient()

  const fetchReviews = useCallback(async () => {
    setLoading(true)

    let query = supabase
      .from('reviews')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * REVIEWS_PER_PAGE, (page + 1) * REVIEWS_PER_PAGE - 1)

    if (ratingFilter !== 'all') {
      query = query.eq('rating', Number(ratingFilter))
    }

    const { data, count } = await query
    setTotal(count || 0)

    if (data && data.length > 0) {
      // Fetch user names for from_user and to_user
      const userIds = new Set<string>()
      data.forEach(r => {
        userIds.add(r.from_user_id)
        userIds.add(r.to_user_id)
      })

      // Try worker_profiles first, then factory_profiles
      const { data: workerProfiles } = await supabase
        .from('worker_profiles')
        .select('user_id, full_name')
        .in('user_id', Array.from(userIds))

      const { data: factoryProfiles } = await supabase
        .from('factory_profiles')
        .select('user_id, company_name')
        .in('user_id', Array.from(userIds))

      const { data: users } = await supabase
        .from('users')
        .select('id, role')
        .in('id', Array.from(userIds))

      const nameMap: Record<string, string> = {}
      const roleMap: Record<string, string> = {}

      workerProfiles?.forEach(w => { nameMap[w.user_id] = w.full_name })
      factoryProfiles?.forEach(f => { nameMap[f.user_id] = f.company_name })
      users?.forEach(u => { roleMap[u.id] = u.role })

      const enriched: ReviewWithUsers[] = data.map(r => ({
        ...r,
        from_user_name: nameMap[r.from_user_id] || null,
        to_user_name: nameMap[r.to_user_id] || null,
        from_user_role: roleMap[r.from_user_id] || null,
        to_user_role: roleMap[r.to_user_id] || null,
      }))

      setReviews(enriched)
    } else {
      setReviews([])
    }

    setLoading(false)
  }, [page, ratingFilter, supabase])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return
    const { error } = await supabase.from('reviews').delete().eq('id', reviewId)
    if (error) {
      toast.error('Không thể xóa đánh giá')
      return
    }
    setReviews(prev => prev.filter(r => r.id !== reviewId))
    setTotal(prev => prev - 1)
    toast.success('Đã xóa đánh giá')
  }

  const totalPages = Math.ceil(total / REVIEWS_PER_PAGE)

  const roleLabel = (role: string | null) => {
    if (role === 'worker') return 'Công nhân'
    if (role === 'factory') return 'Nhà máy'
    return role || ''
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Đánh giá</h1>
            <p className="text-sm text-gray-500">{total} đánh giá</p>
          </div>
          <Select value={ratingFilter} onValueChange={(v) => { setRatingFilter(v); setPage(0) }}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Lọc sao" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả sao</SelectItem>
              <SelectItem value="5">5 sao</SelectItem>
              <SelectItem value="4">4 sao</SelectItem>
              <SelectItem value="3">3 sao</SelectItem>
              <SelectItem value="2">2 sao</SelectItem>
              <SelectItem value="1">1 sao</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Star className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Chưa có đánh giá nào</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {reviews.map(review => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <StarRating rating={review.rating} size="sm" />
                          <span className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <div className="text-sm mb-2">
                          <span className="font-medium text-gray-900">
                            {review.from_user_name || 'Ẩn danh'}
                          </span>
                          {review.from_user_role && (
                            <Badge variant="outline" className="ml-1.5 text-[10px] py-0">
                              {roleLabel(review.from_user_role)}
                            </Badge>
                          )}
                          <span className="text-gray-400 mx-1.5">&rarr;</span>
                          <span className="font-medium text-gray-900">
                            {review.to_user_name || 'Ẩn danh'}
                          </span>
                          {review.to_user_role && (
                            <Badge variant="outline" className="ml-1.5 text-[10px] py-0">
                              {roleLabel(review.to_user_role)}
                            </Badge>
                          )}
                        </div>
                        {review.comment && (
                          <p className="text-sm text-gray-600">{review.comment}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(review.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p - 1)}
                  disabled={page === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  Trang {page + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= totalPages - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
