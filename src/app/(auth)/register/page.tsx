'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { MapPin, Users, Building2, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react'
import type { UserRole } from '@/types'

export default function RegisterPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <RegisterPage />
    </Suspense>
  )
}

function RegisterPage() {
  const searchParams = useSearchParams()
  const initialRole = (searchParams.get('role') as UserRole) || null

  const [step, setStep] = useState<'select' | 'form'>(initialRole ? 'form' : 'select')
  const [role, setRole] = useState<UserRole>(initialRole || 'worker')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          full_name: name,
          phone,
        },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (!data.user) {
      setError('Không thể tạo tài khoản')
      setLoading(false)
      return
    }

    if (role === 'worker') {
      await supabase.from('worker_profiles').insert({
        user_id: data.user.id,
        full_name: name,
      })
    } else if (role === 'factory') {
      await supabase.from('factory_profiles').insert({
        user_id: data.user.id,
        company_name: name,
        contact_phone: phone,
      })

      const { data: trialPlan } = await supabase
        .from('subscription_plans')
        .select('id')
        .eq('slug', 'trial')
        .single()

      if (trialPlan) {
        const now = new Date()
        const trialEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        await supabase.from('subscriptions').insert({
          factory_id: data.user.id,
          plan_id: trialPlan.id,
          status: 'trial',
          start_date: now.toISOString(),
          end_date: trialEnd.toISOString(),
          trial_ends_at: trialEnd.toISOString(),
        })
      }
    }

    const redirectPath = role === 'factory' ? '/factory/dashboard' : '/worker/dashboard'
    router.push(redirectPath)
    router.refresh()
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setError('')

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (oauthError) {
      setError('Không thể đăng ký bằng Google. Vui lòng thử lại.')
      setGoogleLoading(false)
    }
  }

  if (step === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center px-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <MapPin className="h-5 w-5" />
              </div>
              <span className="text-2xl font-bold text-gray-900">Labo</span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Đăng ký tài khoản</h1>
            <p className="text-gray-600 mt-2">Chọn vai trò của bạn</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-500"
              onClick={() => { setRole('worker'); setStep('form') }}
            >
              <CardContent className="p-8 text-center">
                <div className="h-16 w-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Công nhân</h3>
                <p className="text-gray-600 text-sm">Tìm việc làm gần nhà. Hoàn toàn miễn phí, không mất phí.</p>
                <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                  Đăng ký Công nhân <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-amber-500"
              onClick={() => { setRole('factory'); setStep('form') }}
            >
              <CardContent className="p-8 text-center">
                <div className="h-16 w-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Nhà máy / Doanh nghiệp</h3>
                <p className="text-gray-600 text-sm">Tuyển dụng nhanh. Dùng thử miễn phí 1 tháng.</p>
                <Button className="mt-4 bg-amber-600 hover:bg-amber-700">
                  Đăng ký Nhà máy <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          <p className="text-center mt-6 text-sm text-gray-500">
            Đã có tài khoản?{' '}
            <Link href="/login" className="text-emerald-600 hover:underline font-medium">Đăng nhập</Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <MapPin className="h-5 w-5" />
            </div>
          </Link>
          <CardTitle className="text-2xl">
            Đăng ký {role === 'factory' ? 'Nhà máy' : 'Công nhân'}
          </CardTitle>
          {role === 'factory' && (
            <p className="text-sm text-emerald-600 font-medium">Dùng thử miễn phí 1 tháng</p>
          )}
        </CardHeader>
        <CardContent>
          {/* Google Login */}
          <Button
            variant="outline"
            className="w-full mb-4"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Đăng ký bằng Google
          </Button>

          <div className="relative mb-4">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-gray-400">
              hoặc
            </span>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>
            )}
            <div>
              <Label htmlFor="name">
                {role === 'factory' ? 'Tên công ty' : 'Họ và tên'}
              </Label>
              <Input
                id="name"
                placeholder={role === 'factory' ? 'Công ty TNHH ABC' : 'Nguyễn Văn A'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="0901234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ít nhất 8 ký tự"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Đăng ký
            </Button>
          </form>
          <div className="mt-4 flex justify-between text-sm text-gray-500">
            <button
              onClick={() => setStep('select')}
              className="text-emerald-600 hover:underline"
            >
              Đổi vai trò
            </button>
            <Link href="/login" className="text-emerald-600 hover:underline">
              Đã có tài khoản?
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
