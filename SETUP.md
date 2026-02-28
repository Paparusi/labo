# Labo - Huong dan cai dat

## 1. Tao project Supabase

1. Truy cap https://supabase.com va tao project moi
2. Vao **Settings > API** va copy:
   - `Project URL` -> `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` -> `SUPABASE_SERVICE_ROLE_KEY`

3. Cap nhat file `.env.local` voi cac gia tri tren

## 2. Setup Database

1. Vao **SQL Editor** trong Supabase Dashboard
2. Copy noi dung file `supabase/schema.sql` va chay
3. Copy noi dung file `supabase/seed.sql` va chay

## 3. Enable PostGIS

Vao **Database > Extensions** va bat `postgis`

## 4. Setup Mapbox

1. Dang ky tai https://www.mapbox.com
2. Lay Access Token
3. Cap nhat `NEXT_PUBLIC_MAPBOX_TOKEN` trong `.env.local`

## 5. Setup VNPay (Sandbox)

1. Dang ky tai khoan VNPay Sandbox: https://sandbox.vnpayment.vn
2. Lay TMN Code va Hash Secret
3. Cap nhat `VNPAY_TMN_CODE` va `VNPAY_HASH_SECRET` trong `.env.local`

## 6. Chay ung dung

```bash
cd labo
npm install
npm run dev
```

Truy cap http://localhost:3000

## 7. Test

1. Dang ky tai khoan **Cong nhan** -> tu dong chuyen den Worker Dashboard
2. Dang ky tai khoan **Nha may** -> tu dong tao goi dung thu 1 thang
3. Nha may dang tin tuyen -> Cong nhan xem tren ban do
4. Cong nhan ung tuyen -> Nha may nhan thong bao real-time

## Cau truc thu muc chinh

```
src/
  app/
    page.tsx                    # Landing page
    (auth)/                     # Login, Register
    (worker)/worker/            # Worker pages
      dashboard/                # Ban do viec lam
      jobs/                     # Tim viec
      applications/             # Don ung tuyen
      profile/                  # Ho so
      notifications/            # Thong bao
    (factory)/factory/          # Factory pages
      dashboard/                # Bang dieu khien
      jobs/                     # Quan ly tin tuyen
      jobs/new/                 # Dang tin moi
      jobs/[id]/                # Chi tiet + ung vien
      workers/                  # Tim cong nhan
      subscription/             # Goi dich vu
      profile/                  # Ho so cong ty
      notifications/            # Thong bao
    api/
      jobs/nearby/              # API tim viec gan
      workers/nearby/           # API tim cong nhan gan
      subscription/checkout/    # Thanh toan VNPay
      subscription/vnpay-return/# Callback VNPay
  components/
    layout/Header.tsx           # Header navigation
    map/MapView.tsx             # Mapbox map component
    jobs/JobCard.tsx             # Job card component
    subscription/PricingTable.tsx# Bang gia
  lib/
    supabase/                   # Supabase client (browser/server)
    geo.ts                      # Tinh khoang cach
    matching.ts                 # Thuat toan matching
    vnpay.ts                    # Tich hop VNPay
    subscription.ts             # Logic subscription
    i18n.ts                     # Da ngon ngu
  hooks/
    useGeolocation.ts           # Hook vi tri
    useNotifications.ts         # Hook thong bao real-time
  types/index.ts                # TypeScript types
supabase/
  schema.sql                    # Database schema + PostGIS
  seed.sql                      # Du lieu mau
```
