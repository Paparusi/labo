import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Điều khoản dịch vụ',
  description:
    'Điều khoản dịch vụ của Labo - Nền tảng kết nối công nhân với nhà máy.',
}

function Section({
  number,
  title,
  children,
}: {
  number: number
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-gray-900 mb-3">
        {number}. {title}
      </h2>
      <div className="text-gray-700 leading-relaxed space-y-3">{children}</div>
    </section>
  )
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <MapPin className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold text-gray-900">Labo</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Điều khoản dịch vụ
        </h1>
        <p className="text-sm text-gray-500 mb-10">
          Cập nhật lần cuối: 01/03/2026
        </p>

        <Section number={1} title="Giới thiệu">
          <p>
            Labo là nền tảng trực tuyến kết nối công nhân với nhà máy, xí nghiệp
            dựa trên vị trí địa lý. Chúng tôi giúp công nhân tìm được việc làm
            gần nhà và hỗ trợ nhà máy tuyển dụng lao động hiệu quả, nhanh chóng.
          </p>
          <p>
            Bằng việc truy cập và sử dụng nền tảng Labo, bạn đồng ý tuân thủ
            các điều khoản được nêu dưới đây. Vui lòng đọc kỹ trước khi sử dụng
            dịch vụ.
          </p>
        </Section>

        <Section number={2} title="Điều kiện sử dụng">
          <p>Để sử dụng Labo, bạn cần đáp ứng các điều kiện sau:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Đủ 18 tuổi trở lên hoặc có sự đồng ý của người giám hộ hợp pháp.</li>
            <li>Cung cấp thông tin cá nhân chính xác, trung thực khi đăng ký tài khoản.</li>
            <li>Không sử dụng nền tảng cho mục đích bất hợp pháp hoặc vi phạm pháp luật Việt Nam.</li>
            <li>Tuân thủ tất cả các quy định và hướng dẫn của Labo.</li>
          </ul>
        </Section>

        <Section number={3} title="Tài khoản">
          <p>
            Mỗi người dùng chỉ được sở hữu một tài khoản duy nhất trên Labo.
            Bạn có trách nhiệm bảo mật thông tin đăng nhập và chịu trách nhiệm
            cho mọi hoạt động diễn ra dưới tài khoản của mình.
          </p>
          <p>
            Labo có quyền tạm khóa hoặc xóa tài khoản nếu phát hiện hành vi vi
            phạm điều khoản dịch vụ, gian lận, hoặc sử dụng trái phép.
          </p>
        </Section>

        <Section number={4} title="Quyền và nghĩa vụ của công nhân">
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Cung cấp thông tin hồ sơ chính xác bao gồm kinh nghiệm, kỹ năng và vị trí.</li>
            <li>Không gửi đơn ứng tuyển hàng loạt (spam) hoặc ứng tuyển vào các vị trí không phù hợp.</li>
            <li>Tôn trọng các quy định của nhà máy sau khi được tuyển dụng.</li>
            <li>Thông báo kịp thời nếu không còn nhu cầu tìm việc để cập nhật trạng thái hồ sơ.</li>
          </ul>
        </Section>

        <Section number={5} title="Quyền và nghĩa vụ của nhà máy">
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Đăng thông tin tuyển dụng chính xác, rõ ràng về vị trí, mức lương và yêu cầu công việc.</li>
            <li>Thanh toán phí dịch vụ đúng hạn theo gói đã đăng ký.</li>
            <li>Không phân biệt đối xử với ứng viên dựa trên giới tính, tôn giáo hay dân tộc.</li>
            <li>Đảm bảo môi trường làm việc an toàn, tuân thủ quy định pháp luật lao động Việt Nam.</li>
          </ul>
        </Section>

        <Section number={6} title="Thanh toán và gói dịch vụ">
          <p>
            Công nhân sử dụng Labo hoàn toàn miễn phí. Nhà máy có thể lựa chọn
            các gói dịch vụ phù hợp với nhu cầu tuyển dụng.
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Thanh toán được thực hiện qua VNPay và các phương thức được hỗ trợ.</li>
            <li>Gói dịch vụ tự động gia hạn (auto-renewal) trừ khi bạn hủy trước ngày gia hạn.</li>
            <li>
              Hoàn tiền được xem xét trong vòng 7 ngày kể từ ngày thanh toán nếu
              dịch vụ chưa được sử dụng.
            </li>
            <li>Labo có quyền thay đổi giá dịch vụ với thông báo trước ít nhất 30 ngày.</li>
          </ul>
        </Section>

        <Section number={7} title="Nội dung">
          <p>
            Người dùng chịu trách nhiệm hoàn toàn về nội dung mình đăng tải trên
            nền tảng. Nội dung không được vi phạm pháp luật Việt Nam, bao gồm
            nhưng không giới hạn:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Thông tin sai lệch, gian lận hoặc gây hiểu nhầm.</li>
            <li>Nội dung phản cảm, xúc phạm hoặc kích động bạo lực.</li>
            <li>Thông tin vi phạm quyền sở hữu trí tuệ của bên thứ ba.</li>
          </ul>
          <p>
            Labo có quyền gỡ bỏ bất kỳ nội dung nào vi phạm mà không cần thông
            báo trước.
          </p>
        </Section>

        <Section number={8} title="Bảo mật thông tin">
          <p>
            Labo cam kết bảo vệ dữ liệu cá nhân của người dùng theo quy định
            pháp luật Việt Nam về bảo vệ dữ liệu cá nhân. Chi tiết về việc thu
            thập, sử dụng và bảo mật thông tin được quy định trong{' '}
            <Link href="/privacy" className="text-emerald-600 hover:underline">
              Chính sách bảo mật
            </Link>
            .
          </p>
        </Section>

        <Section number={9} title="Miễn trừ trách nhiệm">
          <p>
            Labo hoạt động với vai trò trung gian kết nối công nhân và nhà máy.
            Chúng tôi không chịu trách nhiệm về:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Tranh chấp phát sinh giữa công nhân và nhà máy.</li>
            <li>Tính chính xác của thông tin do người dùng cung cấp.</li>
            <li>Thiệt hại phát sinh từ việc sử dụng hoặc không thể sử dụng dịch vụ.</li>
            <li>Gián đoạn dịch vụ do nguyên nhân bất khả kháng.</li>
          </ul>
        </Section>

        <Section number={10} title="Thay đổi điều khoản">
          <p>
            Labo có quyền thay đổi, bổ sung hoặc cập nhật các điều khoản dịch vụ
            bất kỳ lúc nào. Những thay đổi quan trọng sẽ được thông báo qua email
            và hiển thị trên website ít nhất 15 ngày trước khi có hiệu lực.
          </p>
          <p>
            Việc tiếp tục sử dụng dịch vụ sau khi điều khoản được cập nhật đồng
            nghĩa với việc bạn chấp nhận các thay đổi đó.
          </p>
        </Section>

        <Section number={11} title="Liên hệ">
          <p>
            Nếu bạn có bất kỳ câu hỏi nào về Điều khoản dịch vụ, vui lòng liên
            hệ với chúng tôi:
          </p>
          <ul className="list-none space-y-1 ml-2">
            <li>
              <strong>Email:</strong> support@labo.vn
            </li>
            <li>
              <strong>Hotline:</strong> 1900-xxxx
            </li>
          </ul>
        </Section>
      </main>

      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-900">
            &larr; Về trang chủ
          </Link>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-gray-900">
              Điều khoản dịch vụ
            </Link>
            <Link href="/privacy" className="hover:text-gray-900">
              Chính sách bảo mật
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
