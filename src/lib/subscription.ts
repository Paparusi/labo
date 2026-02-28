/**
 * Subscription management utilities
 */

import type { Subscription, SubscriptionPlan } from '@/types'

export function isSubscriptionActive(sub: Subscription | null): boolean {
  if (!sub) return false
  if (sub.status === 'expired' || sub.status === 'cancelled') return false
  const now = new Date()
  const endDate = new Date(sub.end_date)
  return endDate > now
}

export function getTrialDaysLeft(sub: Subscription | null): number {
  if (!sub || sub.status !== 'trial' || !sub.trial_ends_at) return 0
  const now = new Date()
  const trialEnd = new Date(sub.trial_ends_at)
  const diff = trialEnd.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export function canPostJob(sub: Subscription | null, plan: SubscriptionPlan | null, currentJobCount: number): boolean {
  if (!sub || !plan) return false
  if (!isSubscriptionActive(sub)) return false
  if (plan.max_job_posts === -1) return true // Unlimited
  return currentJobCount < plan.max_job_posts
}

export function canViewProfile(sub: Subscription | null, plan: SubscriptionPlan | null, viewedCount: number): boolean {
  if (!sub || !plan) return false
  if (!isSubscriptionActive(sub)) return false
  if (plan.max_view_profiles === -1) return true // Unlimited
  return viewedCount < plan.max_view_profiles
}

export function getMaxRadius(plan: SubscriptionPlan | null): number {
  if (!plan) return 5 // Default 5km
  return plan.radius_km
}

export function formatPrice(amount: number): string {
  if (amount === 0) return 'Miễn phí'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function getPlanColor(slug: string): string {
  const colors: Record<string, string> = {
    trial: 'border-gray-200 bg-gray-50',
    basic: 'border-blue-200 bg-blue-50',
    pro: 'border-emerald-200 bg-emerald-50',
    enterprise: 'border-purple-200 bg-purple-50',
  }
  return colors[slug] || colors.trial
}

export function getPlanBadgeColor(slug: string): string {
  const colors: Record<string, string> = {
    trial: 'bg-gray-100 text-gray-700',
    basic: 'bg-blue-100 text-blue-700',
    pro: 'bg-emerald-100 text-emerald-700',
    enterprise: 'bg-purple-100 text-purple-700',
  }
  return colors[slug] || colors.trial
}
