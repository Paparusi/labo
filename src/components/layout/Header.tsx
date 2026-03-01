'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'
import { useNotifications } from '@/hooks/useNotifications'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Bell, Menu, X, MapPin, User, LogOut, Building2, Briefcase,
  ChevronDown, MessageSquare, HardHat, Shield,
} from 'lucide-react'

/* ─────────────────────────────────────────────
   Role-specific configuration
   ───────────────────────────────────────────── */
const ROLE_CONFIG: Record<string, {
  label: string
  topBar: string
  avatarBg: string
  badgeCls: string
  Icon: React.ComponentType<{ className?: string }>
  nav: { href: string; label: string }[]
  messages: string | null
  notifications: string | null
  profile: string | null
  home: string
  extra: { href: string; label: string; Icon: React.ComponentType<{ className?: string }> }[]
}> = {
  worker: {
    label: 'Công nhân',
    topBar: 'bg-blue-500',
    avatarBg: 'bg-blue-100 text-blue-700',
    badgeCls: 'bg-blue-50 text-blue-700 border-blue-200',
    Icon: HardHat,
    nav: [
      { href: '/worker/dashboard', label: 'Bản đồ việc làm' },
      { href: '/worker/jobs', label: 'Tìm việc' },
      { href: '/worker/saved-jobs', label: 'Đã lưu' },
      { href: '/worker/applications', label: 'Ứng tuyển' },
    ],
    messages: '/worker/messages',
    notifications: '/worker/notifications',
    profile: '/worker/profile',
    home: '/worker/dashboard',
    extra: [],
  },
  factory: {
    label: 'Nhà máy',
    topBar: 'bg-purple-500',
    avatarBg: 'bg-purple-100 text-purple-700',
    badgeCls: 'bg-purple-50 text-purple-700 border-purple-200',
    Icon: Building2,
    nav: [
      { href: '/factory/dashboard', label: 'Bảng điều khiển' },
      { href: '/factory/jobs', label: 'Tuyển dụng' },
      { href: '/factory/workers', label: 'Tìm công nhân' },
    ],
    messages: '/factory/messages',
    notifications: '/factory/notifications',
    profile: '/factory/profile',
    home: '/factory/dashboard',
    extra: [{ href: '/factory/subscription', label: 'Gói dịch vụ', Icon: Briefcase }],
  },
  admin: {
    label: 'Quản trị viên',
    topBar: 'bg-red-500',
    avatarBg: 'bg-red-100 text-red-700',
    badgeCls: 'bg-red-50 text-red-700 border-red-200',
    Icon: Shield,
    nav: [
      { href: '/admin', label: 'Tổng quan' },
      { href: '/admin/users', label: 'Người dùng' },
      { href: '/admin/jobs', label: 'Tuyển dụng' },
      { href: '/admin/applications', label: 'Ứng tuyển' },
      { href: '/admin/reviews', label: 'Đánh giá' },
    ],
    messages: null,
    notifications: null,
    profile: null,
    home: '/admin',
    extra: [],
  },
}

export default function Header() {
  const { user, loading: userLoading } = useUser()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [unreadMsg, setUnreadMsg] = useState(0)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const { unreadCount: unreadNotif } = useNotifications(user?.id ?? null)

  const cfg = user?.role ? ROLE_CONFIG[user.role] ?? null : null

  const active = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  const navCls = (href: string) =>
    `text-sm font-medium transition-colors ${
      active(href) ? 'text-emerald-600 font-semibold' : 'text-gray-600 hover:text-emerald-600'
    }`

  const mobCls = (href: string) =>
    `block py-2.5 text-sm font-medium ${active(href) ? 'text-emerald-600' : 'text-gray-700 hover:text-emerald-600'}`

  /* Unread messages */
  useEffect(() => {
    if (!user?.id || !cfg?.messages) return

    const fetchUnread = async () => {
      const { data } = await supabase.rpc('get_unread_message_count', { p_user_id: user.id })
      if (data !== null) setUnreadMsg(Number(data) || 0)
    }
    fetchUnread()

    const ch = supabase
      .channel('header-msg')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `receiver_id=eq.${user.id}`,
      }, () => setUnreadMsg(p => p + 1))
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [user?.id, cfg?.messages, supabase])

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  /* ── Loading state: minimal header to prevent guest nav flash ── */
  if (userLoading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container mx-auto flex h-14 items-center px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <MapPin className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold text-gray-900">
              La<span className="text-emerald-600">bo</span>
            </span>
          </Link>
        </div>
      </header>
    )
  }

  /* ── Render ── */
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b shadow-sm">
      {/* Role color bar */}
      {cfg && <div className={`h-1 ${cfg.topBar}`} />}

      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <Link href={cfg?.home || '/'} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <MapPin className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold text-gray-900">
            La<span className="text-emerald-600">bo</span>
          </span>
        </Link>

        {/* ── Desktop Nav ── */}
        {cfg ? (
          <nav className="hidden md:flex items-center gap-1">
            {cfg.nav.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  active(l.href)
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {l.label}
              </Link>
            ))}
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

        {/* ── Right side ── */}
        <div className="flex items-center gap-1.5">
          {cfg ? (
            <>
              {/* Messages icon */}
              {cfg.messages && (
                <Link href={cfg.messages} className="relative p-2 text-gray-500 hover:text-emerald-600 transition-colors rounded-md hover:bg-gray-50">
                  <MessageSquare className="h-5 w-5" />
                  {unreadMsg > 0 && (
                    <span className="absolute top-0.5 right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                      {unreadMsg > 9 ? '9+' : unreadMsg}
                    </span>
                  )}
                </Link>
              )}

              {/* Notifications icon */}
              {cfg.notifications && (
                <Link href={cfg.notifications} className="relative p-2 text-gray-500 hover:text-emerald-600 transition-colors rounded-md hover:bg-gray-50">
                  <Bell className="h-5 w-5" />
                  {unreadNotif > 0 && (
                    <span className="absolute top-0.5 right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                      {unreadNotif > 9 ? '9+' : unreadNotif}
                    </span>
                  )}
                </Link>
              )}

              {/* Role badge (desktop only) */}
              <Badge variant="outline" className={`hidden lg:inline-flex text-xs ml-1 ${cfg.badgeCls}`}>
                <cfg.Icon className="h-3 w-3 mr-1" />
                {cfg.label}
              </Badge>

              {/* User dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1 px-2 ml-1">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${cfg.avatarBg}`}>
                      <cfg.Icon className="h-4 w-4" />
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {/* User info header */}
                  <div className="px-3 py-2.5 border-b">
                    <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                    <div className="mt-1">
                      <Badge variant="outline" className={`text-[10px] ${cfg.badgeCls}`}>
                        <cfg.Icon className="h-2.5 w-2.5 mr-0.5" />
                        {cfg.label}
                      </Badge>
                    </div>
                  </div>

                  {cfg.profile && (
                    <DropdownMenuItem asChild>
                      <Link href={cfg.profile} className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Hồ sơ
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {cfg.extra.map(item => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className="flex items-center gap-2">
                        <item.Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="flex items-center gap-2 text-red-600">
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Đăng nhập</Link>
              </Button>
              <Button size="sm" asChild className="bg-emerald-600 hover:bg-emerald-700">
                <Link href="/register">Đăng ký</Link>
              </Button>
            </div>
          )}

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-white px-4 py-3">
          {cfg ? (
            <>
              {/* Role badge */}
              <div className="pb-3 mb-2 border-b">
                <Badge variant="outline" className={`text-xs ${cfg.badgeCls}`}>
                  <cfg.Icon className="h-3 w-3 mr-1" />
                  {cfg.label}
                </Badge>
                <p className="text-xs text-gray-500 mt-1 truncate">{user?.email}</p>
              </div>

              {/* Nav links */}
              {cfg.nav.map(l => (
                <Link key={l.href} href={l.href} className={mobCls(l.href)} onClick={() => setMobileOpen(false)}>
                  {l.label}
                </Link>
              ))}

              {cfg.messages && (
                <Link href={cfg.messages} className={mobCls(cfg.messages)} onClick={() => setMobileOpen(false)}>
                  Tin nhắn
                  {unreadMsg > 0 && (
                    <Badge className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0">{unreadMsg}</Badge>
                  )}
                </Link>
              )}

              {cfg.notifications && (
                <Link href={cfg.notifications} className={mobCls(cfg.notifications)} onClick={() => setMobileOpen(false)}>
                  Thông báo
                  {unreadNotif > 0 && (
                    <Badge className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0">{unreadNotif}</Badge>
                  )}
                </Link>
              )}

              {cfg.profile && (
                <Link href={cfg.profile} className={mobCls(cfg.profile)} onClick={() => setMobileOpen(false)}>
                  Hồ sơ
                </Link>
              )}

              {cfg.extra.map(item => (
                <Link key={item.href} href={item.href} className={mobCls(item.href)} onClick={() => setMobileOpen(false)}>
                  {item.label}
                </Link>
              ))}

              <div className="pt-2 border-t mt-2">
                <button onClick={logout} className="block w-full text-left py-2 text-sm text-red-600 font-medium">
                  Đăng xuất
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/pricing" className="block py-2 text-sm text-gray-700" onClick={() => setMobileOpen(false)}>Bảng giá</Link>
              <Link href="/#how-it-works" className="block py-2 text-sm text-gray-700" onClick={() => setMobileOpen(false)}>Cách hoạt động</Link>
              <div className="flex gap-3 pt-3 border-t mt-2">
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
