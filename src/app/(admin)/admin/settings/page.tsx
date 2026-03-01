'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Save, Building2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

const BANKS = [
  { bin: '970436', name: 'Vietcombank' },
  { bin: '970418', name: 'BIDV' },
  { bin: '970415', name: 'VietinBank' },
  { bin: '970422', name: 'MB Bank' },
  { bin: '970416', name: 'ACB' },
  { bin: '970432', name: 'TPBank' },
  { bin: '970423', name: 'Techcombank' },
  { bin: '970407', name: 'Techcombank (old)' },
  { bin: '970448', name: 'OCB' },
  { bin: '970405', name: 'Agribank' },
  { bin: '970403', name: 'Sacombank' },
  { bin: '970437', name: 'HDBank' },
  { bin: '970441', name: 'VIB' },
  { bin: '970443', name: 'SHB' },
  { bin: '970431', name: 'Eximbank' },
  { bin: '970426', name: 'MSB' },
  { bin: '970454', name: 'VietABank' },
  { bin: '970429', name: 'SCB' },
  { bin: '970414', name: 'OceanBank' },
  { bin: '970452', name: 'KienLong Bank' },
]

interface BankAccount {
  bank_bin: string
  bank_name: string
  account_no: string
  account_holder: string
}

export default function AdminSettingsPage() {
  const [bankAccount, setBankAccount] = useState<BankAccount>({
    bank_bin: '',
    bank_name: '',
    account_no: '',
    account_holder: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function fetchSettings() {
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
    fetchSettings()
  }, [supabase])

  const handleBankChange = (bin: string) => {
    const bank = BANKS.find(b => b.bin === bin)
    setBankAccount(prev => ({
      ...prev,
      bank_bin: bin,
      bank_name: bank?.name || '',
    }))
  }

  const handleSave = async () => {
    if (!bankAccount.bank_bin || !bankAccount.account_no || !bankAccount.account_holder) {
      toast.error('Vui lòng điền đầy đủ thông tin')
      return
    }

    setSaving(true)
    const { error } = await supabase
      .from('app_settings')
      .upsert({
        key: 'bank_account',
        value: bankAccount,
        updated_at: new Date().toISOString(),
      })

    if (error) {
      toast.error('Không thể lưu cài đặt')
    } else {
      toast.success('Đã lưu thông tin ngân hàng')
    }
    setSaving(false)
  }

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
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Cài đặt hệ thống</h1>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-emerald-600" />
              Tài khoản ngân hàng nhận thanh toán
            </CardTitle>
            <p className="text-sm text-gray-500">
              Thông tin này sẽ hiển thị cho nhà máy khi thanh toán gói dịch vụ qua VietQR.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bank">Ngân hàng</Label>
              <Select value={bankAccount.bank_bin} onValueChange={handleBankChange}>
                <SelectTrigger id="bank">
                  <SelectValue placeholder="Chọn ngân hàng" />
                </SelectTrigger>
                <SelectContent>
                  {BANKS.map(bank => (
                    <SelectItem key={bank.bin} value={bank.bin}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_no">Số tài khoản</Label>
              <Input
                id="account_no"
                value={bankAccount.account_no}
                onChange={e => setBankAccount(prev => ({ ...prev, account_no: e.target.value }))}
                placeholder="VD: 1234567890"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_holder">Chủ tài khoản</Label>
              <Input
                id="account_holder"
                value={bankAccount.account_holder}
                onChange={e => setBankAccount(prev => ({ ...prev, account_holder: e.target.value.toUpperCase() }))}
                placeholder="VD: NGUYEN VAN A"
              />
            </div>

            {/* Preview */}
            {bankAccount.bank_bin && bankAccount.account_no && (
              <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="text-sm font-medium text-emerald-800 mb-2 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Xem trước mã QR
                </p>
                <div className="flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://img.vietqr.io/image/${bankAccount.bank_bin}-${bankAccount.account_no}-compact.png?amount=100000&addInfo=LABO-TEST&accountName=${encodeURIComponent(bankAccount.account_holder)}`}
                    alt="VietQR Preview"
                    className="h-48 w-48 object-contain"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                </div>
                <p className="text-xs text-center text-gray-500 mt-2">
                  {bankAccount.bank_name} - {bankAccount.account_no} - {bankAccount.account_holder}
                </p>
              </div>
            )}

            <Button onClick={handleSave} disabled={saving} className="w-full bg-emerald-600 hover:bg-emerald-700">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Lưu cài đặt
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
