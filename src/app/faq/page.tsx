'use client'

import Header from '@/components/layout/Header'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { HelpCircle, Briefcase, Building2, CreditCard, Shield } from 'lucide-react'

const FAQ_CATEGORIES = [
  {
    title: 'Dành cho công nhân',
    icon: Briefcase,
    color: 'text-blue-600 bg-blue-100',
    items: [
      {
        q: 'Làm thế nào để tìm việc làm gần tôi?',
        a: 'Sau khi đăng ký tài khoản công nhân, hệ thống sẽ tự động xác định vị trí của bạn và hiển thị các công việc gần nhất. Bạn có thể điều chỉnh bán kính tìm kiếm từ 3km đến 20km trên trang Tìm việc.',
      },
      {
        q: 'Tôi có thể ứng tuyển bao nhiêu công việc?',
        a: 'Bạn có thể ứng tuyển không giới hạn số lượng công việc. Tuy nhiên, hãy chỉ ứng tuyển những vị trí phù hợp với kỹ năng và mong muốn của bạn để tăng cơ hội được nhận.',
      },
      {
        q: 'Làm sao để rút đơn ứng tuyển?',
        a: 'Vào trang "Đơn ứng tuyển của tôi", tìm đơn có trạng thái "Chờ xử lý" và nhấn nút "Rút đơn". Lưu ý rằng bạn chỉ có thể rút đơn khi đơn chưa được xử lý.',
      },
      {
        q: 'Hồ sơ của tôi có hiển thị công khai không?',
        a: 'Hồ sơ công khai của bạn (tên, kỹ năng, kinh nghiệm) sẽ được các nhà máy xem khi tìm kiếm công nhân. Thông tin liên hệ chỉ hiển thị khi nhà máy nhắn tin cho bạn.',
      },
      {
        q: 'Tôi có thể lưu công việc để xem sau không?',
        a: 'Có, bạn có thể nhấn biểu tượng dấu trang trên mỗi công việc để lưu lại. Xem danh sách việc đã lưu tại trang "Việc làm đã lưu".',
      },
    ],
  },
  {
    title: 'Dành cho nhà máy',
    icon: Building2,
    color: 'text-amber-600 bg-amber-100',
    items: [
      {
        q: 'Làm thế nào để đăng tin tuyển dụng?',
        a: 'Đăng nhập với tài khoản nhà máy, vào trang "Tin tuyển dụng" và nhấn "Đăng tin mới". Điền đầy đủ thông tin về vị trí tuyển dụng, lương, yêu cầu kỹ năng và địa điểm.',
      },
      {
        q: 'Tôi có thể đăng bao nhiêu tin tuyển dụng?',
        a: 'Số lượng tin tuyển dụng phụ thuộc vào gói đăng ký của bạn. Gói dùng thử cho phép tối đa 5 tin, gói Cơ bản 20 tin, gói Chuyên nghiệp 50 tin, và gói Doanh nghiệp không giới hạn.',
      },
      {
        q: 'Làm sao để tìm công nhân phù hợp?',
        a: 'Vào trang "Tìm công nhân", hệ thống sẽ hiển thị công nhân gần nhà máy của bạn. Bạn có thể lọc theo trạng thái sẵn sàng, bán kính tìm kiếm, và xem hồ sơ chi tiết trước khi liên hệ.',
      },
      {
        q: 'Làm sao để liên hệ với công nhân?',
        a: 'Nhấn nút "Nhắn tin" trên thẻ công nhân để bắt đầu cuộc trò chuyện. Hệ thống tin nhắn hỗ trợ giao tiếp trực tiếp và thông báo theo thời gian thực.',
      },
    ],
  },
  {
    title: 'Gói dịch vụ & Thanh toán',
    icon: CreditCard,
    color: 'text-emerald-600 bg-emerald-100',
    items: [
      {
        q: 'Có gói dùng thử miễn phí không?',
        a: 'Có, tất cả nhà máy đăng ký mới đều được sử dụng gói dùng thử miễn phí trong 1 tháng. Gói này cho phép đăng 5 tin tuyển dụng và tìm kiếm trong bán kính 5km.',
      },
      {
        q: 'Các hình thức thanh toán nào được hỗ trợ?',
        a: 'Hiện tại chúng tôi hỗ trợ thanh toán qua VNPay (thẻ ATM nội địa, Visa, Mastercard, QR Pay). Chúng tôi đang phát triển thêm các phương thức thanh toán khác.',
      },
      {
        q: 'Tôi có thể nâng cấp hoặc hạ cấp gói không?',
        a: 'Bạn có thể nâng cấp gói bất cứ lúc nào. Khi nâng cấp, bạn sẽ được hưởng các quyền lợi mới ngay lập tức. Phần chênh lệch sẽ được tính theo thời gian còn lại.',
      },
      {
        q: 'Có hoàn tiền không nếu tôi hủy gói?',
        a: 'Chúng tôi không hỗ trợ hoàn tiền cho gói đã mua. Tuy nhiên, bạn vẫn có thể sử dụng gói cho đến khi hết hạn. Vui lòng liên hệ hỗ trợ nếu có vấn đề.',
      },
    ],
  },
  {
    title: 'Bảo mật & Quyền riêng tư',
    icon: Shield,
    color: 'text-purple-600 bg-purple-100',
    items: [
      {
        q: 'Thông tin cá nhân của tôi có an toàn không?',
        a: 'Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn. Dữ liệu được mã hóa và lưu trữ an toàn trên hệ thống Supabase. Chỉ những thông tin bạn cho phép mới được hiển thị công khai.',
      },
      {
        q: 'Tôi có thể xóa tài khoản không?',
        a: 'Có, bạn có thể yêu cầu xóa tài khoản trong trang Cài đặt. Toàn bộ dữ liệu cá nhân sẽ được xóa vĩnh viễn trong vòng 30 ngày.',
      },
      {
        q: 'Ai có thể xem hồ sơ của tôi?',
        a: 'Công nhân: Nhà máy trong khu vực có thể xem hồ sơ công khai. Nhà máy: Tất cả người dùng có thể xem trang công ty công khai. Thông tin nhạy cảm (số điện thoại, email) chỉ hiển thị cho bên liên quan.',
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-12 max-w-3xl animate-fade-in-up">
        <div className="text-center mb-10">
          <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="h-6 w-6 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Câu hỏi thường gặp</h1>
          <p className="text-gray-600 mt-2">Tìm câu trả lời cho những thắc mắc phổ biến về Labo</p>
        </div>

        <div className="space-y-8">
          {FAQ_CATEGORIES.map((category) => (
            <div key={category.title}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`h-9 w-9 rounded-lg ${category.color} flex items-center justify-center`}>
                  <category.icon className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">{category.title}</h2>
              </div>
              <Accordion type="single" collapsible className="bg-white rounded-xl border">
                {category.items.map((item, i) => (
                  <AccordionItem key={i} value={`${category.title}-${i}`} className="px-4">
                    <AccordionTrigger className="text-left text-sm font-medium text-gray-800 hover:text-emerald-600">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-gray-600 leading-relaxed">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
