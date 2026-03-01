'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminSidebar from '@/components/layout/AdminSidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table'
import { Loader2, Search, ChevronLeft, ChevronRight, ShieldCheck, ShieldOff } from 'lucide-react'
import type { User, UserRole } from '@/types'

const USERS_PER_PAGE = 20

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function getRoleBadge(role: string): React.ReactNode {
  switch (role) {
    case 'worker':
      return <Badge className="bg-blue-100 text-blue-700">Công nhân</Badge>
    case 'factory':
      return <Badge className="bg-purple-100 text-purple-700">Nhà máy</Badge>
    case 'admin':
      return <Badge className="bg-red-100 text-red-700">Quản trị</Badge>
    default:
      return <Badge className="bg-gray-100 text-gray-700">{role}</Badge>
  }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(0)
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const supabase = createClient()

  const fetchUsers = useCallback(async () => {
    setLoading(true)

    let query = supabase
      .from('users')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * USERS_PER_PAGE, (page + 1) * USERS_PER_PAGE - 1)

    if (roleFilter !== 'all') {
      query = query.eq('role', roleFilter as UserRole)
    }

    if (searchQuery.trim()) {
      query = query.or(`email.ilike.%${searchQuery.trim()}%,phone.ilike.%${searchQuery.trim()}%`)
    }

    const { data, count } = await query

    if (data) setUsers(data)
    setTotalCount(count ?? 0)
    setLoading(false)
  }, [supabase, page, roleFilter, searchQuery])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  async function handleToggleActive(userId: string, currentActive: boolean) {
    setTogglingId(userId)

    const { error } = await supabase
      .from('users')
      .update({ is_active: !currentActive })
      .eq('id', userId)

    if (!error) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: !currentActive } : u))
      )
    }

    setTogglingId(null)
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPage(0)
    fetchUsers()
  }

  const totalPages = Math.ceil(totalCount / USERS_PER_PAGE)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
          <p className="text-gray-500 mt-1">Quản lý tài khoản người dùng trên nền tảng</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="text-lg">
                Danh sách người dùng ({totalCount})
              </CardTitle>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                {/* Role filter */}
                <Select
                  value={roleFilter}
                  onValueChange={(value) => {
                    setRoleFilter(value)
                    setPage(0)
                  }}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Lọc vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="worker">Công nhân</SelectItem>
                    <SelectItem value="factory">Nhà máy</SelectItem>
                  </SelectContent>
                </Select>

                {/* Search */}
                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Tìm theo email hoặc SĐT..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-[240px]"
                    />
                  </div>
                  <Button type="submit" variant="outline" size="sm">
                    Tìm
                  </Button>
                </form>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email / SĐT</TableHead>
                      <TableHead>Vai trò</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="text-sm">
                          {user.email || user.phone || '---'}
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {formatDate(user.created_at)}
                        </TableCell>
                        <TableCell>
                          {user.is_active ? (
                            <Badge className="bg-green-100 text-green-700">Hoạt động</Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-500">Vô hiệu</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={togglingId === user.id || user.role === 'admin'}
                            onClick={() => handleToggleActive(user.id, user.is_active)}
                            className={
                              user.is_active
                                ? 'text-red-600 hover:bg-red-50 border-red-200'
                                : 'text-emerald-600 hover:bg-emerald-50 border-emerald-200'
                            }
                          >
                            {togglingId === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : user.is_active ? (
                              <>
                                <ShieldOff className="h-4 w-4 mr-1" />
                                Vô hiệu hóa
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="h-4 w-4 mr-1" />
                                Kích hoạt
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {users.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                          Không tìm thấy người dùng nào
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <p className="text-sm text-gray-500">
                      Trang {page + 1} / {totalPages} (tổng {totalCount} người dùng)
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 0}
                        onClick={() => setPage((p) => p - 1)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Trước
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages - 1}
                        onClick={() => setPage((p) => p + 1)}
                      >
                        Sau
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
