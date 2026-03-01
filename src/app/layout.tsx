import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: {
    default: 'Labo - Tìm việc gần, Tuyển dụng nhanh',
    template: '%s | Labo',
  },
  description:
    'Labo - Nền tảng marketplace kết nối công nhân với nhà máy gần nhất. Tìm việc nhanh, tuyển dụng hiệu quả dựa trên vị trí địa lý.',
  keywords: [
    'labo',
    'tìm việc',
    'tuyển dụng',
    'công nhân',
    'nhà máy',
    'việc làm',
    'gần nhà',
  ],
  authors: [{ name: 'Labo' }],
  creator: 'Labo',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    siteName: 'Labo',
    title: 'Labo - Tìm việc gần, Tuyển dụng nhanh',
    description:
      'Nền tảng kết nối công nhân với nhà máy gần nhất. Tìm việc nhanh, tuyển dụng hiệu quả.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Labo - Tìm việc gần, Tuyển dụng nhanh',
    description: 'Nền tảng kết nối công nhân với nhà máy gần nhất.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
