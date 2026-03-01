'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import StarRating from '@/components/shared/StarRating'
import ReviewList from '@/components/shared/ReviewList'
import type { User, WorkerProfile } from '@/types'
import {
  User as UserIcon, MapPin, Calendar, Clock, Briefcase,
  Loader2, ArrowLeft, MessageSquare,
} from 'lucide-react'

const AVAIL_LABELS: Record<string, string> = {
  immediate: 'Sẵn sàng ngay',
  one_week: 'Trong 1 tuần',
  one_month: 'Trong 1 tháng',
}

const GENDER_LABELS: Record<string, string> = {
  male: 'Nam', female: 'Nữ', other: 'Khác',
}

export default function WorkerProfilePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [user, setUser] = useState<User | null>(null)
  const [worker, setWorker] = useState<WorkerProfile | null>(null)
  const [avgRating, setAvgRating] = useState(0)
  const [reviewCount, setReviewCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      setLoading(true)

      // Get current user (optional)
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data: userData } = await supabase.from('users').select('*').eq('id', authUser.id).single()
        if (userData) setUser(userData)
      }

      // Fetch worker profile
      const { data: workerData, error } = await supabase
        .from('worker_profiles')
        .select('*')
        .eq('user_id', id)
        .single()

      if (error || !workerData) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setWorker(workerData)

      // Fetch rating
      const { data: ratingData } = await supabase.rpc('get_user_avg_rating', { p_user_id: id })
      if (ratingData && typeof ratingData === 'object') {
        setAvgRating(Number((ratingData as Record<string, unknown>).avg_rating) || 0)
        setReviewCount(Number((ratingData as Record<string, unknown>).review_count) || 0)
      }

      setLoading(false)
    }

    if (id) fetchData()
  }, [id, supabase])

  const handleMessage = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return
    const { data: convId } = await supabase.rpc('get_or_create_conversation', {
      user_a: authUser.id,
      user_b: id,
    })
    if (convId) {
      const role = user?.role === 'factory' ? 'factory' : 'worker'
      router.push(`/${role}/messages/${convId}`)
    }
  }

  const getInitials = (name: string) => {
    const words = name.trim().split(' ')
    if (words.length === 1) return words[0].charAt(0).toUpperCase()
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </div>
    )
  }

  if (notFound || !worker) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} />
        <div className="container mx-auto max-w-3xl px-4 py-16 text-center">
          <UserIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy công nhân</h1>
          <p className="text-gray-500 mb-6">Hồ sơ này không tồn tại hoặc đã bị xóa.</p>
          <Button asChild variant="outline">
            <Link href="/"><ArrowLeft className="h-4 w-4 mr-2" />Quay lại</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <main className="container mx-auto max-w-3xl px-4 py-6 space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-gray-600 hover:text-emerald-600 -ml-2">
          <ArrowLeft className="h-4 w-4 mr-1" />Quay lại
        </Button>

        {/* Worker Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={worker.avatar_url || undefined} />
                <AvatarFallback className="bg-blue-100 text-blue-700 text-lg font-semibold">
                  {getInitials(worker.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-900">{worker.full_name}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {worker.gender && (
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                      {GENDER_LABELS[worker.gender] || worker.gender}
                    </Badge>
                  )}
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
                    <Clock className="h-3 w-3 mr-1" />
                    {AVAIL_LABELS[worker.availability] || worker.availability}
                  </Badge>
                  <Badge variant="secondary" className="bg-purple-50 text-purple-700">
                    <Briefcase className="h-3 w-3 mr-1" />
                    {worker.experience_years} năm kinh nghiệm
                  </Badge>
                </div>
                {worker.address && (
                  <div className="flex items-start gap-1.5 text-sm text-gray-600 mt-2">
                    <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-gray-400" />
                    <span>{worker.address}</span>
                  </div>
                )}
                {avgRating > 0 && (
                  <div className="mt-3">
                    <StarRating rating={avgRating} showValue count={reviewCount} />
                  </div>
                )}
              </div>
            </div>

            {/* Message button (only for logged-in factory users) */}
            {user && user.role === 'factory' && user.id !== id && (
              <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700" onClick={handleMessage}>
                <MessageSquare className="h-4 w-4 mr-2" />Nhắn tin
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Bio */}
        {worker.bio && (
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Giới thiệu</CardTitle></CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{worker.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Skills */}
        {worker.skills?.length > 0 && (
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Kỹ năng</CardTitle></CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                {worker.skills.map(skill => (
                  <Badge key={skill} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Details */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Thông tin chi tiết</CardTitle></CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">Kinh nghiệm:</span>
              <span className="text-gray-900 font-medium">{worker.experience_years} năm</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">Khả dụng:</span>
              <span className="text-gray-900 font-medium">{AVAIL_LABELS[worker.availability] || worker.availability}</span>
            </div>
            {worker.gender && (
              <div className="flex items-center gap-2 text-sm">
                <UserIcon className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">Giới tính:</span>
                <span className="text-gray-900 font-medium">{GENDER_LABELS[worker.gender]}</span>
              </div>
            )}
            {worker.date_of_birth && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">Ngày sinh:</span>
                <span className="text-gray-900 font-medium">{new Date(worker.date_of_birth).toLocaleDateString('vi-VN')}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reviews */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Đánh giá</CardTitle></CardHeader>
          <CardContent className="pt-0">
            <ReviewList userId={id} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
