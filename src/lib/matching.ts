/**
 * Matching Algorithm: Score workers against jobs and vice versa
 *
 * Match Score =
 *   Distance (40%) + Skills (30%) + Availability (15%) +
 *   Rating (10%) + Profile Completeness (5%)
 */

import type { WorkerProfile, Job, MatchScore } from '@/types'

const WEIGHTS = {
  distance: 0.4,
  skills: 0.3,
  availability: 0.15,
  rating: 0.1,
  completeness: 0.05,
}

export function calculateMatchScore(
  worker: WorkerProfile,
  job: Job,
  distanceKm: number,
  maxRadiusKm: number,
  avgRating: number = 0
): MatchScore {
  // Distance score: closer = higher score
  const distanceScore = Math.max(0, 1 - distanceKm / maxRadiusKm)

  // Skills score: intersection / required skills
  const requiredSkills = job.skills_required || []
  const workerSkills = worker.skills || []
  const skillsScore = requiredSkills.length > 0
    ? workerSkills.filter(s => requiredSkills.some(r =>
        r.toLowerCase().includes(s.toLowerCase()) ||
        s.toLowerCase().includes(r.toLowerCase())
      )).length / requiredSkills.length
    : 0.5 // If no specific skills required, give 50%

  // Availability score
  const availabilityMap: Record<string, number> = {
    'immediate': 1.0,
    'one_week': 0.7,
    'one_month': 0.3,
  }
  const availabilityScore = availabilityMap[worker.availability] || 0.5

  // Rating score
  const ratingScore = avgRating / 5

  // Profile completeness
  const fields = [
    worker.full_name, worker.date_of_birth, worker.gender,
    worker.address, worker.latitude, worker.bio, worker.avatar_url,
    worker.skills?.length > 0, worker.experience_years > 0,
  ]
  const completenessScore = fields.filter(Boolean).length / fields.length

  const total =
    WEIGHTS.distance * distanceScore +
    WEIGHTS.skills * skillsScore +
    WEIGHTS.availability * availabilityScore +
    WEIGHTS.rating * ratingScore +
    WEIGHTS.completeness * completenessScore

  return {
    distance_score: Math.round(distanceScore * 100),
    skills_score: Math.round(skillsScore * 100),
    availability_score: Math.round(availabilityScore * 100),
    rating_score: Math.round(ratingScore * 100),
    total: Math.round(total * 100),
  }
}

export function getMatchLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Rất phù hợp', color: 'bg-green-100 text-green-800' }
  if (score >= 60) return { label: 'Phù hợp', color: 'bg-emerald-100 text-emerald-800' }
  if (score >= 40) return { label: 'Tương đối', color: 'bg-yellow-100 text-yellow-800' }
  return { label: 'Ít phù hợp', color: 'bg-gray-100 text-gray-800' }
}
