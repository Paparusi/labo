'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell, Menu, X, MapPin, User, LogOut, Building2, Briefcase, ChevronDown, MessageSquare, Bookmark } from 'lucide-react'
import type { User as UserType } from '@/types'

interface HeaderProps {
  user: UserType | null
  unreadNotifications?: number
  unreadMessages?: number
}

export default function Header({ user, unreadNotifications = 0, unreadMessages = 0 }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const dashboardPath = user?.role === 'factory' ? '/factory/dashboard' : '/worker/dashboard'

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href={user ? dashboardPath : '/'} className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <MapPin className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-gray-900">
            La<span className="text-emerald-600">bo</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        {user ? (
          <nav className="hidden md:flex items-center gap-6">
            {user.role === 'worker' ? (
              <>
                <Link href="/worker/dashboard" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">
                  Bản đồ việc làm
                </Link>
                <Link href="/worker/jobs" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">
                  Tìm việc
                </Link>
                <Link href="/worker/saved-jobs" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">
                  Việc làm đã lưu
                </Link>
                <Link href="/worker/applications" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">
                  Đơn ứng tuyển
                </Link>
                <Link href="/worker/messages" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">
                  Tin nhắn
                </Link>
              </>
            ) : (
              <>
                <Link href="/factory/dashboard" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">
                  Bảng điều khiển
                </Link>
                <Link href="/factory/jobs" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">
                  Tin tuyển dụng
                </Link>
                <Link href="/factory/workers" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">
                  Tìm công nhân
                </Link>
                <Link href="/factory/messages" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">
                  Tin nhắn
                </Link>
              </>
            )}
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">
              Bảng giá
            </Link>
            <Link href="/#how-it-works" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">
              Cách hoạt động
            </Link>
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Messages */}
              <Link href={`/${user.role}/messages`} className="relative p-2 text-gray-600 hover:text-emerald-600">
                <MessageSquare className="h-5 w-5" />
                {unreadMessages > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-red-500">
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </Badge>
                )}
              </Link>

              {/* Notifications */}
              <Link href={`/${user.role}/notifications`} className="relative p-2 text-gray-600 hover:text-emerald-600">
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-red-500">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </Badge>
                )}
              </Link>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      {user.role === 'factory' ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href={`/${user.role}/profile`} className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Hồ sơ
                    </Link>
                  </DropdownMenuItem>
                  {user.role === 'factory' && (
                    <DropdownMenuItem asChild>
                      <Link href="/factory/subscription" className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Gói dịch vụ
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-red-600">
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link href="/login">Đăng nhập</Link>
              </Button>
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                <Link href="/register">Đăng ký</Link>
              </Button>
            </div>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white px-4 py-4 space-y-3">
          {user ? (
            <>
              {user.role === 'worker' ? (
                <>
                  <Link href="/worker/dashboard" className="block py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>Bản đồ việc làm</Link>
                  <Link href="/worker/jobs" className="block py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>Tìm việc</Link>
                  <Link href="/worker/saved-jobs" className="block py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>Việc làm đã lưu</Link>
                  <Link href="/worker/applications" className="block py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>Đơn ứng tuyển</Link>
                  <Link href="/worker/messages" className="block py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>Tin nhắn</Link>
                  <Link href="/worker/profile" className="block py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>Hồ sơ</Link>
                </>
              ) : (
                <>
                  <Link href="/factory/dashboard" className="block py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>Bảng điều khiển</Link>
                  <Link href="/factory/jobs" className="block py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>Tin tuyển dụng</Link>
                  <Link href="/factory/workers" className="block py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>Tìm công nhân</Link>
                  <Link href="/factory/messages" className="block py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>Tin nhắn</Link>
                  <Link href="/factory/subscription" className="block py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>Gói dịch vụ</Link>
                </>
              )}
              <button onClick={handleLogout} className="block w-full text-left py-2 text-red-600">Đăng xuất</button>
            </>
          ) : (
            <>
              <Link href="/pricing" className="block py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>Bảng giá</Link>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" asChild className="flex-1">
                  <Link href="/login">Đăng nhập</Link>
                </Button>
                <Button asChild className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                  <Link href="/register">Đăng ký</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  )
}
