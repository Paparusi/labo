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
              Nền tảng #1 kết nối công nhân - nhà máy theo vị trí
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
              Kết nối công nhân với{' '}
              <span className="text-emerald-600">nhà máy gần nhất</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Tìm việc trong bán kính 5km. Ứng tuyển 1 chạm. Công nhân tìm việc nhanh,
              nhà máy tuyển dụng hiệu quả. Giảm tỷ lệ nghỉ việc đến 60%.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8 h-14" asChild>
                <Link href="/register?role=worker">
                  <UserCheck className="mr-2 h-5 w-5" />
                  Tìm việc ngay - Miễn phí
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 h-14 border-2" asChild>
                <Link href="/register?role=factory">
                  <Building2 className="mr-2 h-5 w-5" />
                  Tuyển dụng - Thử miễn phí 1 tháng
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-gray-400">
              Công nhân sử dụng hoàn toàn miễn phí. Nhà máy dùng thử 1 tháng, không cần thẻ tín dụng.
            </p>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { value: '50,000+', label: 'Công nhân', icon: Users },
              { value: '1,200+', label: 'Nhà máy', icon: Building2 },
              { value: '8,500+', label: 'Việc làm', icon: Briefcase },
              { value: '25,000+', label: 'Đã tuyển', icon: UserCheck },
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
            <Badge variant="secondary" className="mb-4">Cách hoạt động</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">3 bước để kết nối</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: '01', icon: Smartphone, title: 'Đăng ký & Tạo hồ sơ', desc: 'Tạo tài khoản trong 30 giây. Công nhân nhập kỹ năng, vị trí. Nhà máy nhập thông tin công ty.', color: 'bg-blue-100 text-blue-600' },
              { step: '02', icon: MapPin, title: 'Xem bản đồ & Tìm kiếm', desc: 'Bản đồ hiển thị việc làm / công nhân gần vị trí của bạn. Lọc theo khoảng cách, ngành nghề, mức lương.', color: 'bg-emerald-100 text-emerald-600' },
              { step: '03', icon: Zap, title: 'Kết nối & Làm việc', desc: 'Công nhân ứng tuyển 1 chạm. Nhà máy nhận thông báo real-time. Tuyển dụng xong trong 1-3 ngày.', color: 'bg-purple-100 text-purple-600' },
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
                <h3 className="text-2xl font-bold">Dành cho Công nhân</h3>
                <p className="text-blue-100 mt-1">Hoàn toàn miễn phí</p>
              </div>
              <CardContent className="p-6 space-y-4">
                {[
                  'Tìm việc trong bán kính 5km, tiết kiệm di chuyển',
                  'Ứng tuyển 1 chạm, nhanh chóng tiện lợi',
                  'Xem mức lương rõ ràng trước khi ứng tuyển',
                  'Nhận thông báo khi có việc làm mới gần bạn',
                  'Theo dõi trạng thái đơn ứng tuyển real-time',
                  'Đánh giá nhà máy để lựa chọn tốt hơn',
                ].map((b) => (
                  <div key={b} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{b}</span>
                  </div>
                ))}
                <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700" size="lg" asChild>
                  <Link href="/register?role=worker">Tìm việc ngay <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
                <Building2 className="h-8 w-8 mb-2" />
                <h3 className="text-2xl font-bold">Dành cho Nhà máy</h3>
                <p className="text-amber-100 mt-1">Dùng thử miễn phí 1 tháng</p>
              </div>
              <CardContent className="p-6 space-y-4">
                {[
                  'Tìm công nhân gần nhà máy, giảm tỷ lệ nghỉ việc 60%',
                  'Đăng tin tuyển dụng & nhận đơn ứng tuyển trong vài phút',
                  'Bản đồ nhiệt hiển thị mật độ công nhân theo khu vực',
                  'Thuật toán matching thông minh dựa trên vị trí + kỹ năng',
                  'Dashboard phân tích: thời gian tuyển, chi phí, hiệu quả',
                  'Quản lý nhiều chiến dịch tuyển dụng cùng lúc',
                ].map((b) => (
                  <div key={b} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{b}</span>
                  </div>
                ))}
                <Button className="w-full mt-4 bg-amber-600 hover:bg-amber-700" size="lg" asChild>
                  <Link href="/register?role=factory">Tuyển dụng ngay <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-4">Bảng giá</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Gói dịch vụ linh hoạt</h2>
          <p className="text-gray-600 mb-10 max-w-2xl mx-auto">
            Bắt đầu với gói dùng thử miễn phí 1 tháng. Nâng cấp bất cứ lúc nào.
          </p>
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { name: 'Dùng thử', price: 'Miễn phí', period: '1 tháng', features: ['5 tin tuyển', '20 hồ sơ', '5km'], highlight: false },
              { name: 'Cơ bản', price: '2,000,000d', period: '/tháng', features: ['20 tin tuyển', '100 hồ sơ', '10km'], highlight: false },
              { name: 'Chuyên nghiệp', price: '5,000,000d', period: '/tháng', features: ['50 tin tuyển', 'Hồ sơ không giới hạn', '20km', 'Analytics'], highlight: true },
              { name: 'Doanh nghiệp', price: '15,000,000d', period: '/tháng', features: ['Không giới hạn', 'API Access', '50km', 'Hỗ trợ 24/7'], highlight: false },
            ].map((plan) => (
              <Card key={plan.name} className={`${plan.highlight ? 'ring-2 ring-emerald-500 shadow-lg scale-105' : ''}`}>
                {plan.highlight && <div className="bg-emerald-600 text-white text-sm py-1 rounded-t-lg">Phổ biến nhất</div>}
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
            <Link href="/pricing">Xem chi tiết <ChevronRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      {/* Trust */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { icon: Shield, title: 'Bảo mật & Tin cậy', desc: 'Dữ liệu được mã hóa. Thông tin cá nhân được bảo vệ.' },
              { icon: BarChart3, title: 'Data-driven', desc: 'Thuật toán matching dựa trên vị trí thực tế và thời gian di chuyển.' },
              { icon: Clock, title: 'Nhanh chóng', desc: 'Trung bình 2.5 ngày từ lúc đăng tin đến khi tuyển được công nhân.' },
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Sẵn sàng bắt đầu?</h2>
          <p className="text-emerald-100 mb-8 text-lg max-w-xl mx-auto">
            Tham gia cùng 50,000+ công nhân và 1,200+ nhà máy đang sử dụng Labo
          </p>
          <Button size="lg" className="bg-white text-emerald-700 hover:bg-gray-100 text-lg px-8" asChild>
            <Link href="/register">Đăng ký miễn phí</Link>
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
              <p className="text-sm">Nền tảng kết nối công nhân với nhà máy gần nhất.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Công nhân</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/register?role=worker" className="hover:text-white">Đăng ký tìm việc</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Nhà máy</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/register?role=factory" className="hover:text-white">Đăng ký tuyển dụng</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Bảng giá</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Hỗ trợ</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/terms" className="hover:text-white">Điều khoản dịch vụ</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Chính sách bảo mật</Link></li>
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
