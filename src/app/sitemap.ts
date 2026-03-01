import type { MetadataRoute } from 'next'
import { createServiceClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://labo-production-5eb2.up.railway.app'

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  try {
    const supabase = await createServiceClient()

    // Fetch public factory profiles
    const { data: factories } = await supabase
      .from('factory_profiles')
      .select('user_id, updated_at')
      .limit(500)

    const factoryPages: MetadataRoute.Sitemap = (factories || []).map(f => ({
      url: `${baseUrl}/factory/${f.user_id}`,
      lastModified: new Date(f.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

    // Fetch public worker profiles
    const { data: workers } = await supabase
      .from('worker_profiles')
      .select('user_id, updated_at')
      .limit(500)

    const workerPages: MetadataRoute.Sitemap = (workers || []).map(w => ({
      url: `${baseUrl}/worker/${w.user_id}`,
      lastModified: new Date(w.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

    return [...staticPages, ...factoryPages, ...workerPages]
  } catch {
    // If DB is unavailable, return static pages only
    return staticPages
  }
}
