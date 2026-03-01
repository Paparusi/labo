import Link from 'next/link'
import { MapPin, ArrowLeft, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
            <MapPin className="h-8 w-8 text-emerald-600" />
          </div>
        </div>
        <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Trang không tìm thấy</h2>
        <p className="text-gray-500 mb-8">
          Trang bạn đang tìm không tồn tại hoặc đã được di chuyển.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/"><ArrowLeft className="h-4 w-4 mr-2" />Về trang chủ</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/register"><Search className="h-4 w-4 mr-2" />Tìm việc ngay</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
