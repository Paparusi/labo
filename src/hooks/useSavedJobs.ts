'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useSavedJobs() {
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Fetch saved jobs on mount
  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setLoading(false)
          return
        }

        const { data, error } = await supabase
          .from('saved_jobs')
          .select('job_id')
          .eq('worker_id', user.id)

        if (error) throw error

        const jobIds = new Set(data?.map((item) => item.job_id) || [])
        setSavedJobIds(jobIds)
      } catch (error) {
        console.error('Error fetching saved jobs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSavedJobs()
  }, [])

  const toggleSave = async (jobId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const isSaved = savedJobIds.has(jobId)

      if (isSaved) {
        // Remove from saved jobs
        const { error } = await supabase
          .from('saved_jobs')
          .delete()
          .eq('worker_id', user.id)
          .eq('job_id', jobId)

        if (error) throw error

        setSavedJobIds((prev) => {
          const newSet = new Set(prev)
          newSet.delete(jobId)
          return newSet
        })
      } else {
        // Add to saved jobs
        const { error } = await supabase
          .from('saved_jobs')
          .insert({ worker_id: user.id, job_id: jobId })

        if (error) throw error

        setSavedJobIds((prev) => new Set(prev).add(jobId))
      }
    } catch (error) {
      console.error('Error toggling saved job:', error)
    }
  }

  const isSaved = (jobId: string) => savedJobIds.has(jobId)

  return { savedJobIds, toggleSave, isSaved, loading }
}
