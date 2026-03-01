# Labo - Hướng dẫn triển khai Production

## Yêu cầu trước khi go-live

### 1. VNPay (Thanh toán)
Đăng ký tài khoản merchant tại [VNPay](https://vnpay.vn):
- Thay `VNPAY_TMN_CODE` bằng mã merchant thật
- Thay `VNPAY_HASH_SECRET` bằng secret key thật
- Đổi `VNPAY_URL` sang URL production: `https://pay.vnpay.vn/vpcpay.html`
- Cập nhật `VNPAY_RETURN_URL` sang domain thật

### 2. Resend (Email)
Tạo tài khoản tại [Resend](https://resend.com):
- Verify domain gửi email (DNS records)
- Tạo API key và set `RESEND_API_KEY`
- Cập nhật email "from" trong `src/lib/email.ts` sang domain đã verify

### 3. Custom Domain
Trong Vercel dashboard:
- Settings → Domains → Add domain
- Cấu hình DNS (CNAME hoặc A record)
- Cập nhật `NEXT_PUBLIC_APP_URL` sang domain mới

### 4. Mapbox
Trong [Mapbox dashboard](https://account.mapbox.com):
- Tạo token mới với URL restriction (chỉ cho phép domain production)
- Cập nhật `NEXT_PUBLIC_MAPBOX_TOKEN`

### 5. Sentry (Error Tracking)
Tạo project tại [Sentry](https://sentry.io):
- Tạo Next.js project
- Copy DSN và set `NEXT_PUBLIC_SENTRY_DSN` trên Vercel
- (Optional) Set `SENTRY_AUTH_TOKEN` để upload source maps

### 6. Supabase
Kiểm tra trong Supabase dashboard:
- Database backups đã bật (Settings → Database → Backups)
- RLS policies hoạt động đúng
- Xóa hoặc đổi password test accounts nếu cần

## Biến môi trường (Vercel)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Yes | Mapbox GL access token |
| `NEXT_PUBLIC_APP_URL` | Yes | Production URL |
| `VNPAY_TMN_CODE` | Yes | VNPay merchant code |
| `VNPAY_HASH_SECRET` | Yes | VNPay hash secret |
| `VNPAY_URL` | Yes | VNPay payment URL |
| `VNPAY_RETURN_URL` | Yes | VNPay return URL |
| `RESEND_API_KEY` | Yes | Resend email API key |
| `NEXT_PUBLIC_SENTRY_DSN` | Optional | Sentry DSN for error tracking |
| `SENTRY_AUTH_TOKEN` | Optional | Sentry auth token for source maps |

## Health Check
Endpoint: `GET /api/health`
Response: `{ "status": "ok", "timestamp": "..." }`

## Monitoring
- Sentry: Error tracking + performance monitoring
- Vercel: Built-in analytics + function logs
- Supabase: Database metrics + auth logs
