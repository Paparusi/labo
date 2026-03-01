'use client'

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`rounded animate-shimmer ${className}`} />
}

export function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="flex-1">
                <Skeleton className="h-7 w-16 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Content cards */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <Skeleton className="h-5 w-40 mb-4" />
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center justify-between py-3">
              <div>
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border p-6">
          <Skeleton className="h-5 w-32 mb-4" />
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-10 w-full mb-3 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}

export function JobListSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
      <Skeleton className="h-10 w-96 mb-4 rounded-lg" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="bg-white rounded-xl border p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl border p-6">
            <Skeleton className="h-5 w-40 mb-4" />
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-36" />
                </div>
              </div>
              <Skeleton className="h-10 w-full rounded-lg" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </div>
          </div>
        ))}
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  )
}

export function JobSearchSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6">
      <Skeleton className="h-8 w-36 mb-6" />
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
        <Skeleton className="h-10 w-28 rounded-lg" />
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
      {/* Job cards */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-xl border p-5">
            <div className="flex items-start gap-4">
              <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-5 w-56 mb-2" />
                <Skeleton className="h-4 w-32 mb-3" />
                <div className="flex gap-3">
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-10 w-24 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
