import type { Metadata } from 'next'
import { createServiceClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ id: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://labo-production-5eb2.up.railway.app'

  try {
    const supabase = await createServiceClient()
    const { data: factory } = await supabase
      .from('factory_profiles')
      .select('company_name, industry, address, description')
      .eq('user_id', id)
      .single()

    if (!factory) {
      return { title: 'Nhà máy không tìm thấy' }
    }

    const title = `${factory.company_name} - Tuyển dụng`
    const description = factory.description
      ? factory.description.slice(0, 160)
      : `${factory.company_name} đang tuyển dụng trên Labo. ${factory.address ? `Địa chỉ: ${factory.address}` : ''}`

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'profile',
        url: `${baseUrl}/factory/${id}`,
        siteName: 'Labo',
        locale: 'vi_VN',
      },
      twitter: {
        card: 'summary',
        title,
        description,
      },
    }
  } catch {
    return { title: 'Nhà máy | Labo' }
  }
}

export default function Layout({ children }: Props) {
  return children
}
