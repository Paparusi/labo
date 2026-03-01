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
    const { data: worker } = await supabase
      .from('worker_profiles')
      .select('full_name, skills, experience_years, bio, availability')
      .eq('user_id', id)
      .single()

    if (!worker) {
      return { title: 'Công nhân không tìm thấy' }
    }

    const title = `${worker.full_name} - Hồ sơ công nhân`
    const skillsText = worker.skills?.length > 0 ? worker.skills.slice(0, 3).join(', ') : ''
    const description = worker.bio
      ? worker.bio.slice(0, 160)
      : `${worker.full_name} - ${worker.experience_years} năm kinh nghiệm${skillsText ? `. Kỹ năng: ${skillsText}` : ''}`

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'profile',
        url: `${baseUrl}/worker/${id}`,
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
    return { title: 'Công nhân | Labo' }
  }
}

export default function Layout({ children }: Props) {
  return children
}
