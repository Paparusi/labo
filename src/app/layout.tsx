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
  title: 'Labo - Tim viec gan, Tuyen dung nhanh',
  description: 'Labo - Nen tang marketplace ket noi cong nhan voi nha may gan nhat. Tim viec nhanh, tuyen dung hieu qua dua tren vi tri dia ly.',
  keywords: ['labo', 'tim viec', 'tuyen dung', 'cong nhan', 'nha may', 'viec lam', 'gan nha'],
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
