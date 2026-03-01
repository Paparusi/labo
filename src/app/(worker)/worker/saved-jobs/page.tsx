'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

import Header from '@/components/layout/Header'
import JobCard from '@/components/jobs/JobCard'
import { useSavedJobs } from '@/hooks/useSavedJobs'
import { Bookmark } from 'lucide-react'
import type { Job } from '@/types'

export default function SavedJobsPage() {

  const [savedJobs, setSavedJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const { toggleSave, isSaved } = useSavedJobs()
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) return

        // Fetch saved jobs with job details and factory info
        const { data: savedJobsData, error } = await supabase
          .from('saved_jobs')
          .select(`
            job_id,
            jobs (
              *,
              factory:factory_profiles!factory_id (
                company_name,
                logo_url
              )
            )
          `)
          .eq('worker_id', authUser.id)
          .order('created_at', { ascending: false })

        if (error) throw error

        // Transform the data to match Job type
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const jobs = (savedJobsData
          ?.map((item: any) => ({
            ...item.jobs,
            factory: item.jobs.factory,
          }))
          .filter((job: any) => job && job.status === 'active') || []) as Job[]

        setSavedJobs(jobs)
      } catch (error) {
        console.error('Error fetching saved jobs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleToggleSave = async (jobId: string) => {
    await toggleSave(jobId)
    // Remove from list if unsaved
    setSavedJobs((prev) => prev.filter((job) => job.id !== jobId))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Việc làm đã lưu</h1>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : savedJobs.length > 0 ? (
            <div className="space-y-4">
              {savedJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  showApplyButton={false}
                  isSaved={isSaved(job.id)}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <Bookmark className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Chưa lưu việc làm nào
              </h2>
              <p className="text-gray-500 mb-6">
                Lưu các công việc bạn quan tâm để xem lại sau
              </p>
              <Link
                href="/worker/jobs"
                className="inline-block px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
              >
                Tìm việc làm
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
