/**
 * VNPay Integration for Subscription Payments
 * Docs: https://sandbox.vnpayment.vn/apis/
 */

import crypto from 'crypto'

interface VNPayConfig {
  tmnCode: string
  hashSecret: string
  url: string
  returnUrl: string
}

function getConfig(): VNPayConfig {
  return {
    tmnCode: process.env.VNPAY_TMN_CODE!,
    hashSecret: process.env.VNPAY_HASH_SECRET!,
    url: process.env.VNPAY_URL!,
    returnUrl: process.env.VNPAY_RETURN_URL!,
  }
}

function sortObject(obj: Record<string, string>): Record<string, string> {
  const sorted: Record<string, string> = {}
  const keys = Object.keys(obj).sort()
  for (const key of keys) {
    sorted[key] = obj[key]
  }
  return sorted
}

export function createPaymentUrl(params: {
  orderId: string
  amount: number
  orderInfo: string
  ipAddr: string
  locale?: string
}): string {
  const config = getConfig()
  const date = new Date()

  const createDate = date.toISOString().replace(/[-:T.Z]/g, '').slice(0, 14)

  const vnpParams: Record<string, string> = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: config.tmnCode,
    vnp_Locale: params.locale || 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: params.orderId,
    vnp_OrderInfo: params.orderInfo,
    vnp_OrderType: 'subscription',
    vnp_Amount: String(params.amount * 100), // VNPay requires amount * 100
    vnp_ReturnUrl: config.returnUrl,
    vnp_IpAddr: params.ipAddr,
    vnp_CreateDate: createDate,
  }

  const sorted = sortObject(vnpParams)
  const signData = new URLSearchParams(sorted).toString()
  const hmac = crypto.createHmac('sha512', config.hashSecret)
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')

  sorted['vnp_SecureHash'] = signed

  return `${config.url}?${new URLSearchParams(sorted).toString()}`
}

export function verifyReturnUrl(query: Record<string, string>): {
  isValid: boolean
  responseCode: string
  txnRef: string
} {
  const config = getConfig()
  const secureHash = query['vnp_SecureHash']

  const params = { ...query }
  delete params['vnp_SecureHash']
  delete params['vnp_SecureHashType']

  const sorted = sortObject(params)
  const signData = new URLSearchParams(sorted).toString()
  const hmac = crypto.createHmac('sha512', config.hashSecret)
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')

  return {
    isValid: secureHash === signed,
    responseCode: query['vnp_ResponseCode'] || '',
    txnRef: query['vnp_TxnRef'] || '',
  }
}
