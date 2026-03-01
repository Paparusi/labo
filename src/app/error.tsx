'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { MapPin, AlertTriangle, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Đã xảy ra lỗi</h1>
        <p className="text-gray-500 mb-6">
          Rất tiếc, đã có lỗi xảy ra. Vui lòng thử lại hoặc quay về trang chủ.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button onClick={reset} className="bg-emerald-600 hover:bg-emerald-700">
            <RefreshCw className="h-4 w-4 mr-2" />Thử lại
          </Button>
          <Button variant="outline" asChild>
            <a href="/">
              <MapPin className="h-4 w-4 mr-2" />Về trang chủ
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
