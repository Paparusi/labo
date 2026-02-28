'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  MapPin, Briefcase, Users, Zap, Shield, BarChart3,
  ArrowRight, Check, Clock,
  ChevronRight, Smartphone, Building2, UserCheck,
} from 'lucide-react'
import Header from '@/components/layout/Header'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header user={null} />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="container mx-auto px-4 py-20 lg:py-32 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="bg-emerald-100 text-emerald-700 mb-6 px-4 py-1.5 text-sm">
              <Zap className="h-3.5 w-3.5 mr-1" />
              Nen tang #1 ket noi cong nhan - nha may theo vi tri
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
              Ket noi cong nhan voi{' '}
              <span className="text-emerald-600">nha may gan nhat</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Tim viec trong ban kinh 5km. Ung tuyen 1 cham. Cong nhan tim viec nhanh,
              nha may tuyen dung hieu qua. Giam ty le nghi viec den 60%.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8 h-14" asChild>
                <Link href="/register?role=worker">
                  <UserCheck className="mr-2 h-5 w-5" />
                  Tim viec ngay - Mien phi
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 h-14 border-2" asChild>
                <Link href="/register?role=factory">
                  <Building2 className="mr-2 h-5 w-5" />
                  Tuyen dung - Thu mien phi 1 thang
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-gray-400">
              Cong nhan su dung hoan toan mien phi. Nha may dung thu 1 thang, khong can the tin dung.
            </p>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { value: '50,000+', label: 'Cong nhan', icon: Users },
              { value: '1,200+', label: 'Nha may', icon: Building2 },
              { value: '8,500+', label: 'Viec lam', icon: Briefcase },
              { value: '25,000+', label: 'Da tuyen', icon: UserCheck },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                <div className="text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Cach hoat dong</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">3 buoc de ket noi</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: '01', icon: Smartphone, title: 'Dang ky & Tao ho so', desc: 'Tao tai khoan trong 30 giay. Cong nhan nhap ky nang, vi tri. Nha may nhap thong tin cong ty.', color: 'bg-blue-100 text-blue-600' },
              { step: '02', icon: MapPin, title: 'Xem ban do & Tim kiem', desc: 'Ban do hien thi viec lam / cong nhan gan vi tri cua ban. Loc theo khoang cach, nganh nghe, muc luong.', color: 'bg-emerald-100 text-emerald-600' },
              { step: '03', icon: Zap, title: 'Ket noi & Lam viec', desc: 'Cong nhan ung tuyen 1 cham. Nha may nhan thong bao real-time. Tuyen dung xong trong 1-3 ngay.', color: 'bg-purple-100 text-purple-600' },
            ].map((item) => (
              <Card key={item.step} className="relative border-0 shadow-lg">
                <div className="absolute -top-4 left-6">
                  <span className="text-5xl font-bold text-gray-100">{item.step}</span>
                </div>
                <CardContent className="pt-10 pb-8 px-6">
                  <div className={`h-12 w-12 rounded-xl ${item.color} flex items-center justify-center mb-4`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* For Workers & Factories */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                <Users className="h-8 w-8 mb-2" />
                <h3 className="text-2xl font-bold">Danh cho Cong nhan</h3>
                <p className="text-blue-100 mt-1">Hoan toan mien phi</p>
              </div>
              <CardContent className="p-6 space-y-4">
                {[
                  'Tim viec trong ban kinh 5km, tiet kiem di chuyen',
                  'Ung tuyen 1 cham, nhanh chong tien loi',
                  'Xem muc luong ro rang truoc khi ung tuyen',
                  'Nhan thong bao khi co viec lam moi gan ban',
                  'Theo doi trang thai don ung tuyen real-time',
                  'Danh gia nha may de lua chon tot hon',
                ].map((b) => (
                  <div key={b} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{b}</span>
                  </div>
                ))}
                <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700" size="lg" asChild>
                  <Link href="/register?role=worker">Tim viec ngay <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
                <Building2 className="h-8 w-8 mb-2" />
                <h3 className="text-2xl font-bold">Danh cho Nha may</h3>
                <p className="text-amber-100 mt-1">Dung thu mien phi 1 thang</p>
              </div>
              <CardContent className="p-6 space-y-4">
                {[
                  'Tim cong nhan gan nha may, giam ty le nghi viec 60%',
                  'Dang tin tuyen dung & nhan don ung tuyen trong vai phut',
                  'Ban do nhiet hien thi mat do cong nhan theo khu vuc',
                  'Thuat toan matching thong minh dua tren vi tri + ky nang',
                  'Dashboard phan tich: thoi gian tuyen, chi phi, hieu qua',
                  'Quan ly nhieu chien dich tuyen dung cung luc',
                ].map((b) => (
                  <div key={b} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{b}</span>
                  </div>
                ))}
                <Button className="w-full mt-4 bg-amber-600 hover:bg-amber-700" size="lg" asChild>
                  <Link href="/register?role=factory">Tuyen dung ngay <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-4">Bang gia</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Goi dich vu linh hoat</h2>
          <p className="text-gray-600 mb-10 max-w-2xl mx-auto">
            Bat dau voi goi dung thu mien phi 1 thang. Nang cap bat cu luc nao.
          </p>
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { name: 'Dung thu', price: 'Mien phi', period: '1 thang', features: ['5 tin tuyen', '20 ho so', '5km'], highlight: false },
              { name: 'Co ban', price: '2,000,000d', period: '/thang', features: ['20 tin tuyen', '100 ho so', '10km'], highlight: false },
              { name: 'Chuyen nghiep', price: '5,000,000d', period: '/thang', features: ['50 tin tuyen', 'Ho so khong gioi han', '20km', 'Analytics'], highlight: true },
              { name: 'Doanh nghiep', price: '15,000,000d', period: '/thang', features: ['Khong gioi han', 'API Access', '50km', 'Ho tro 24/7'], highlight: false },
            ].map((plan) => (
              <Card key={plan.name} className={`${plan.highlight ? 'ring-2 ring-emerald-500 shadow-lg scale-105' : ''}`}>
                {plan.highlight && <div className="bg-emerald-600 text-white text-sm py-1 rounded-t-lg">Pho bien nhat</div>}
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-2xl font-bold">{plan.price}</span>
                    <span className="text-gray-500 text-sm">{plan.period}</span>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm text-gray-600">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-600" />{f}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button size="lg" variant="outline" className="mt-10" asChild>
            <Link href="/pricing">Xem chi tiet <ChevronRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      {/* Trust */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { icon: Shield, title: 'Bao mat & Tin cay', desc: 'Du lieu duoc ma hoa. Thong tin ca nhan duoc bao ve.' },
              { icon: BarChart3, title: 'Data-driven', desc: 'Thuat toan matching dua tren vi tri thuc te va thoi gian di chuyen.' },
              { icon: Clock, title: 'Nhanh chong', desc: 'Trung binh 2.5 ngay tu luc dang tin den khi tuyen duoc cong nhan.' },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center">
                <div className="h-14 w-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
                  <item.icon className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900">{item.title}</h3>
                <p className="text-gray-600 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">San sang bat dau?</h2>
          <p className="text-emerald-100 mb-8 text-lg max-w-xl mx-auto">
            Tham gia cung 50,000+ cong nhan va 1,200+ nha may dang su dung Labo
          </p>
          <Button size="lg" className="bg-white text-emerald-700 hover:bg-gray-100 text-lg px-8" asChild>
            <Link href="/register">Dang ky mien phi</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                  <MapPin className="h-4 w-4" />
                </div>
                <span className="text-lg font-bold text-white">Labo</span>
              </Link>
              <p className="text-sm">Nen tang ket noi cong nhan voi nha may gan nhat.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Cong nhan</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/register?role=worker" className="hover:text-white">Dang ky tim viec</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Nha may</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/register?role=factory" className="hover:text-white">Dang ky tuyen dung</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Bang gia</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Lien he</h4>
              <ul className="space-y-2 text-sm">
                <li>Email: support@labo.vn</li>
                <li>Hotline: 1900-xxxx</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2026 Labo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
