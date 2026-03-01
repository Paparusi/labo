'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Copy, CheckCircle2, Clock, QrCode } from 'lucide-react'
import { formatPrice } from '@/lib/subscription'
import { toast } from 'sonner'
import type { SubscriptionPlan } from '@/types'

interface BankAccount {
  bank_bin: string
  bank_name: string
  account_no: string
  account_holder: string
}

interface BankTransferModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: SubscriptionPlan
  interval: 'monthly' | 'yearly'
  onSuccess: () => void
}

export default function BankTransferModal({
  open,
  onOpenChange,
  plan,
  interval,
  onSuccess,
}: BankTransferModalProps) {
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const supabase = createClient()

  const amount = interval === 'yearly' ? plan.price_yearly : plan.price_monthly
  const transferNote = `LABO-${Date.now().toString(36).toUpperCase()}`

  useEffect(() => {
    if (!open) return
    setSubmitted(false)

    async function fetchBankAccount() {
      setLoading(true)
      const { data } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'bank_account')
        .single()

      if (data?.value) {
        setBankAccount(data.value as BankAccount)
      }
      setLoading(false)
    }
    fetchBankAccount()
  }, [open, supabase])

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`Đã sao chép ${label}`)
  }

  const handleSubmit = async () => {
    setSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Vui lòng đăng nhập lại')
      setSubmitting(false)
      return
    }

    const orderId = `VN${Date.now()}`
    const { error } = await supabase.from('payments').insert({
      factory_id: user.id,
      amount,
      method: 'bank_transfer',
      transaction_id: orderId,
      transfer_note: transferNote,
      status: 'pending',
      vnpay_data: { plan_id: plan.id, interval },
    })

    if (error) {
      toast.error('Không thể tạo yêu cầu thanh toán')
      setSubmitting(false)
      return
    }

    setSubmitted(true)
    setSubmitting(false)
    onSuccess()
  }

  const qrUrl = bankAccount
    ? `https://img.vietqr.io/image/${bankAccount.bank_bin}-${bankAccount.account_no}-compact.png?amount=${amount}&addInfo=${encodeURIComponent(transferNote)}&accountName=${encodeURIComponent(bankAccount.account_holder)}`
    : ''

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-emerald-600" />
            Thanh toán chuyển khoản
          </AlertDialogTitle>
          <AlertDialogDescription>
            Gói {plan.name} ({interval === 'yearly' ? '12 tháng' : '1 tháng'}) - {formatPrice(amount)}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : !bankAccount ? (
          <div className="text-center py-8 text-gray-500">
            <p>Chưa cấu hình tài khoản ngân hàng.</p>
            <p className="text-sm mt-1">Vui lòng liên hệ quản trị viên.</p>
          </div>
        ) : submitted ? (
          <div className="text-center py-8">
            <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Đã ghi nhận!</h3>
            <p className="text-gray-600 text-sm mb-4">
              Yêu cầu thanh toán đang chờ xác nhận từ quản trị viên.
              Gói dịch vụ sẽ được kích hoạt sau khi xác nhận.
            </p>
            <Badge className="bg-amber-100 text-amber-700">
              <Clock className="h-3.5 w-3.5 mr-1" />
              Chờ xác nhận
            </Badge>
          </div>
        ) : (
          <div className="space-y-4">
            {/* QR Code */}
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrUrl}
                alt="VietQR"
                className="h-56 w-56 object-contain rounded-lg border"
              />
            </div>

            {/* Bank info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Ngân hàng</span>
                <span className="text-sm font-medium">{bankAccount.bank_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Số tài khoản</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium font-mono">{bankAccount.account_no}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => copyToClipboard(bankAccount.account_no, 'số tài khoản')}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Chủ TK</span>
                <span className="text-sm font-medium">{bankAccount.account_holder}</span>
              </div>
              <div className="border-t pt-3 flex items-center justify-between">
                <span className="text-sm text-gray-500">Số tiền</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-emerald-600">{formatPrice(amount)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => copyToClipboard(amount.toString(), 'số tiền')}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Nội dung CK</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold font-mono text-blue-600">{transferNote}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => copyToClipboard(transferNote, 'nội dung')}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>

            <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
              Quan trọng: Vui lòng nhập chính xác nội dung chuyển khoản để hệ thống xác nhận nhanh hơn.
            </p>
          </div>
        )}

        <AlertDialogFooter>
          {submitted ? (
            <Button onClick={() => onOpenChange(false)} className="bg-emerald-600 hover:bg-emerald-700">
              Đóng
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              {bankAccount && (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Đã chuyển khoản
                </Button>
              )}
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
