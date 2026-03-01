import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Chính sách bảo mật',
  description:
    'Chính sách bảo mật của Labo - Cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu của bạn.',
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

export default function PrivacyPage() {
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
          Chính sách bảo mật
        </h1>
        <p className="text-sm text-gray-500 mb-10">
          Cập nhật lần cuối: 01/03/2026
        </p>

        <Section number={1} title="Thu thập thông tin">
          <p>
            Khi sử dụng Labo, chúng tôi thu thập các loại thông tin sau để cung
            cấp và cải thiện dịch vụ:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              <strong>Thông tin cá nhân:</strong> Họ tên, số điện thoại, email,
              ngày sinh.
            </li>
            <li>
              <strong>Thông tin nghề nghiệp:</strong> Kỹ năng, kinh nghiệm làm
              việc, ngành nghề mong muốn (đối với công nhân).
            </li>
            <li>
              <strong>Thông tin doanh nghiệp:</strong> Tên công ty, địa chỉ,
              giấy phép kinh doanh, thông tin liên hệ (đối với nhà máy).
            </li>
            <li>
              <strong>Vị trí địa lý:</strong> Tọa độ GPS hoặc địa chỉ để hỗ trợ
              tìm kiếm theo khoảng cách.
            </li>
            <li>
              <strong>Dữ liệu sử dụng:</strong> Thông tin về cách bạn tương tác
              với nền tảng, thiết bị và trình duyệt.
            </li>
          </ul>
        </Section>

        <Section number={2} title="Mục đích sử dụng">
          <p>Chúng tôi sử dụng thông tin thu thập được để:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Kết nối công nhân với nhà máy dựa trên vị trí và kỹ năng phù hợp.</li>
            <li>Cải thiện thuật toán matching và trải nghiệm người dùng.</li>
            <li>Gửi thông báo về việc làm mới, trạng thái đơn ứng tuyển và cập nhật dịch vụ.</li>
            <li>Xử lý thanh toán và quản lý gói dịch vụ.</li>
            <li>Phân tích dữ liệu tổng hợp để nâng cao chất lượng nền tảng.</li>
            <li>Ngăn chặn gian lận và bảo vệ an toàn cho người dùng.</li>
          </ul>
        </Section>

        <Section number={3} title="Chia sẻ thông tin">
          <p>
            Labo cam kết không bán, cho thuê hoặc trao đổi dữ liệu cá nhân của
            bạn cho bên thứ ba vì mục đích thương mại. Chúng tôi chỉ chia sẻ
            thông tin trong các trường hợp sau:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              <strong>Giữa công nhân và nhà máy:</strong> Khi công nhân ứng tuyển,
              nhà máy sẽ nhận được thông tin hồ sơ liên quan. Khi nhà máy đăng
              tin, công nhân sẽ thấy thông tin tuyển dụng.
            </li>
            <li>
              <strong>Đối tác thanh toán:</strong> Thông tin cần thiết để xử lý
              giao dịch qua VNPay.
            </li>
            <li>
              <strong>Yêu cầu pháp lý:</strong> Khi có yêu cầu từ cơ quan chức
              năng theo quy định pháp luật.
            </li>
          </ul>
        </Section>

        <Section number={4} title="Vị trí địa lý">
          <p>
            Vị trí địa lý là tính năng cốt lõi của Labo, giúp tìm kiếm việc làm
            và công nhân trong phạm vi gần nhất. Cụ thể:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Vị trí được sử dụng để tính khoảng cách và hiển thị kết quả tìm kiếm phù hợp.</li>
            <li>Bạn có thể tắt chia sẻ vị trí bất kỳ lúc nào trong cài đặt thiết bị.</li>
            <li>Khi tắt vị trí, một số tính năng tìm kiếm theo khoảng cách sẽ bị hạn chế.</li>
            <li>Chúng tôi không theo dõi vị trí liên tục, chỉ cập nhật khi bạn sử dụng ứng dụng.</li>
          </ul>
        </Section>

        <Section number={5} title="Bảo mật dữ liệu">
          <p>
            Chúng tôi áp dụng các biện pháp bảo mật tiêu chuẩn ngành để bảo vệ
            dữ liệu của bạn:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Mã hóa dữ liệu trong quá trình truyền tải (SSL/TLS) và lưu trữ.</li>
            <li>Xác thực bảo mật qua Supabase Auth với mã hóa mật khẩu bcrypt.</li>
            <li>Phân quyền truy cập dữ liệu (Row Level Security) đảm bảo người dùng chỉ truy cập dữ liệu của mình.</li>
            <li>Giám sát hệ thống liên tục để phát hiện và ngăn chặn truy cập trái phép.</li>
          </ul>
        </Section>

        <Section number={6} title="Cookie">
          <p>Labo sử dụng cookie cho các mục đích sau:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              <strong>Cookie xác thực:</strong> Lưu trữ phiên đăng nhập để bạn
              không cần đăng nhập lại mỗi lần truy cập.
            </li>
            <li>
              <strong>Cookie chức năng:</strong> Ghi nhớ các tùy chọn cài đặt của
              bạn.
            </li>
          </ul>
          <p>
            Chúng tôi không sử dụng cookie theo dõi quảng cáo của bên thứ ba.
          </p>
        </Section>

        <Section number={7} title="Quyền của bạn">
          <p>
            Bạn có các quyền sau đối với dữ liệu cá nhân của mình trên Labo:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              <strong>Quyền truy cập:</strong> Xem toàn bộ dữ liệu cá nhân mà
              chúng tôi lưu trữ về bạn.
            </li>
            <li>
              <strong>Quyền chỉnh sửa:</strong> Cập nhật, sửa đổi thông tin cá
              nhân bất kỳ lúc nào qua trang hồ sơ.
            </li>
            <li>
              <strong>Quyền xóa:</strong> Yêu cầu xóa tài khoản và toàn bộ dữ
              liệu liên quan bằng cách liên hệ support@labo.vn.
            </li>
            <li>
              <strong>Quyền di chuyển:</strong> Yêu cầu xuất dữ liệu cá nhân
              dưới định dạng phổ biến.
            </li>
          </ul>
        </Section>

        <Section number={8} title="Lưu trữ dữ liệu">
          <p>
            Dữ liệu của bạn được lưu trữ trên hệ thống máy chủ an toàn tại
            Singapore, sử dụng dịch vụ Supabase với các tiêu chuẩn bảo mật quốc
            tế SOC 2 Type II.
          </p>
          <p>
            Dữ liệu được lưu giữ trong suốt thời gian bạn sử dụng dịch vụ và
            sẽ được xóa trong vòng 30 ngày sau khi tài khoản bị xóa, trừ khi
            pháp luật yêu cầu lưu giữ lâu hơn.
          </p>
        </Section>

        <Section number={9} title="Thay đổi chính sách">
          <p>
            Labo có quyền cập nhật Chính sách bảo mật này bất kỳ lúc nào. Những
            thay đổi quan trọng sẽ được thông báo qua:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Email đến địa chỉ đã đăng ký.</li>
            <li>Thông báo trên website và ứng dụng.</li>
          </ul>
          <p>
            Chúng tôi khuyến khích bạn kiểm tra trang này định kỳ để nắm bắt các
            cập nhật mới nhất.
          </p>
        </Section>

        <Section number={10} title="Liên hệ">
          <p>
            Nếu bạn có câu hỏi hoặc yêu cầu liên quan đến Chính sách bảo mật,
            vui lòng liên hệ:
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
