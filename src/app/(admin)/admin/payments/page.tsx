'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table'
import { Loader2, CheckCircle2, XCircle, CreditCard, Clock } from 'lucide-react'
import { formatPrice } from '@/lib/subscription'
import { toast } from 'sonner'
import ConfirmDialog from '@/components/shared/ConfirmDialog'

interface PaymentRow {
  id: string
  factory_id: string
  amount: number
  method: string
  transaction_id: string | null
  transfer_note: string | null
  status: string
  vnpay_data: { plan_id?: string; interval?: string } | null
  created_at: string
  factory_profile: { company_name: string } | null
  plan: { name: string } | null
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmAction, setConfirmAction] = useState<{ paymentId: string; action: 'confirm' | 'reject' } | null>(null)
  const supabase = createClient()

  const fetchPayments = async () => {
    // Fetch payments with factory name via factory_profiles
    const { data } = await supabase
      .from('payments')
      .select(`
        *,
        factory_profile:factory_profiles!payments_factory_id_fkey(company_name)
      `)
      .order('created_at', { ascending: false })
      .limit(100)

    if (data) {
      // Fetch plan names for each payment
      const enriched = await Promise.all(
        data.map(async (p: Record<string, unknown>) => {
          const vnpayData = p.vnpay_data as { plan_id?: string; interval?: string } | null
          let plan = null
          if (vnpayData?.plan_id) {
            const { data: planData } = await supabase
              .from('subscription_plans')
              .select('name')
              .eq('id', vnpayData.plan_id)
              .single()
            plan = planData
          }
          return { ...p, plan } as PaymentRow
        })
      )
      setPayments(enriched)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPayments()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleConfirm = async (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId)
    if (!payment) return

    // Update payment status to success
    const { error: payError } = await supabase
      .from('payments')
      .update({ status: 'success' })
      .eq('id', paymentId)

    if (payError) {
      toast.error('Không thể xác nhận thanh toán')
      return
    }

    // Activate subscription (same logic as vnpay-return)
    const vnpayData = payment.vnpay_data
    const now = new Date()
    const interval = vnpayData?.interval || 'monthly'
    const endDate = new Date(now)
    if (interval === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1)
    } else {
      endDate.setMonth(endDate.getMonth() + 1)
    }

    // Deactivate old subscriptions
    await supabase
      .from('subscriptions')
      .update({ status: 'expired' })
      .eq('factory_id', payment.factory_id)
      .in('status', ['trial', 'active'])

    // Create new subscription
    const { error: subError } = await supabase
      .from('subscriptions')
      .insert({
        factory_id: payment.factory_id,
        plan_id: vnpayData?.plan_id,
        status: 'active',
        start_date: now.toISOString(),
        end_date: endDate.toISOString(),
      })

    if (subError) {
      toast.error('Đã xác nhận thanh toán nhưng không tạo được gói dịch vụ')
    } else {
      toast.success('Đã xác nhận thanh toán và kích hoạt gói dịch vụ')
    }

    fetchPayments()
  }

  const handleReject = async (paymentId: string) => {
    const { error } = await supabase
      .from('payments')
      .update({ status: 'failed' })
      .eq('id', paymentId)

    if (error) {
      toast.error('Không thể từ chối thanh toán')
    } else {
      toast.success('Đã từ chối thanh toán')
    }

    fetchPayments()
  }

  const pendingCount = payments.filter(p => p.status === 'pending').length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý thanh toán</h1>
            <p className="text-gray-500 text-sm mt-1">Xác nhận hoặc từ chối các giao dịch chuyển khoản</p>
          </div>
          {pendingCount > 0 && (
            <Badge className="bg-amber-100 text-amber-700 text-sm px-3 py-1">
              <Clock className="h-3.5 w-3.5 mr-1" />
              {pendingCount} chờ xác nhận
            </Badge>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5 text-emerald-600" />
              Danh sách thanh toán
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nhà máy</TableHead>
                  <TableHead>Gói</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Nội dung CK</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map(p => (
                  <TableRow key={p.id} className={p.status === 'pending' ? 'bg-amber-50/50' : ''}>
                    <TableCell className="font-medium text-sm">
                      {p.factory_profile?.company_name || p.factory_id.slice(0, 8)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {p.plan?.name || '---'}
                      {p.vnpay_data?.interval && (
                        <span className="text-xs text-gray-400 ml-1">
                          ({p.vnpay_data.interval === 'yearly' ? 'Năm' : 'Tháng'})
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm font-medium">{formatPrice(p.amount)}</TableCell>
                    <TableCell className="text-sm text-gray-600 font-mono">
                      {p.transfer_note || p.transaction_id || '---'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(p.created_at).toLocaleDateString('vi-VN', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        p.status === 'success' ? 'bg-green-100 text-green-700' :
                        p.status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }>
                        {p.status === 'success' ? 'Thành công' :
                         p.status === 'failed' ? 'Từ chối' : 'Chờ xác nhận'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {p.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 h-8"
                            onClick={() => setConfirmAction({ paymentId: p.id, action: 'confirm' })}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            Xác nhận
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 h-8"
                            onClick={() => setConfirmAction({ paymentId: p.id, action: 'reject' })}
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1" />
                            Từ chối
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {payments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-12">
                      Chưa có giao dịch thanh toán nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={() => setConfirmAction(null)}
        title={confirmAction?.action === 'confirm' ? 'Xác nhận thanh toán' : 'Từ chối thanh toán'}
        description={
          confirmAction?.action === 'confirm'
            ? 'Xác nhận đã nhận được tiền chuyển khoản? Gói dịch vụ sẽ được kích hoạt ngay.'
            : 'Từ chối giao dịch này? Nhà máy sẽ cần thực hiện lại thanh toán.'
        }
        confirmLabel={confirmAction?.action === 'confirm' ? 'Xác nhận' : 'Từ chối'}
        variant={confirmAction?.action === 'reject' ? 'destructive' : 'default'}
        onConfirm={async () => {
          if (!confirmAction) return
          if (confirmAction.action === 'confirm') {
            await handleConfirm(confirmAction.paymentId)
          } else {
            await handleReject(confirmAction.paymentId)
          }
        }}
      />
    </div>
  )
}
