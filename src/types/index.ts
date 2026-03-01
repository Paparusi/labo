// ==================== Enums ====================
export type UserRole = 'worker' | 'factory' | 'admin'
export type Gender = 'male' | 'female' | 'other'
export type FactorySize = 'small' | 'medium' | 'large'
export type Availability = 'immediate' | 'one_week' | 'one_month'
export type ShiftType = 'day' | 'night' | 'rotating' | 'flexible'
export type JobStatus = 'active' | 'closed' | 'draft'
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn'
export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'cancelled'
export type PaymentStatus = 'pending' | 'success' | 'failed'
export type PlanInterval = 'monthly' | 'yearly'

// ==================== Database Types ====================
export interface User {
  id: string
  phone: string | null
  email: string | null
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface WorkerProfile {
  id: string
  user_id: string
  full_name: string
  date_of_birth: string | null
  gender: Gender | null
  address: string | null
  latitude: number | null
  longitude: number | null
  skills: string[]
  experience_years: number
  availability: Availability
  avatar_url: string | null
  bio: string | null
  phone_public: boolean
  created_at: string
  updated_at: string
}

export interface FactoryProfile {
  id: string
  user_id: string
  company_name: string
  industry: string | null
  address: string | null
  latitude: number | null
  longitude: number | null
  size: FactorySize
  contact_person: string | null
  contact_phone: string | null
  logo_url: string | null
  description: string | null
  website: string | null
  created_at: string
  updated_at: string
}

export interface Job {
  id: string
  factory_id: string
  title: string
  description: string | null
  industry: string | null
  skills_required: string[]
  salary_min: number | null
  salary_max: number | null
  positions: number
  shift_type: ShiftType
  gender_requirement: Gender | null
  start_date: string | null
  end_date: string | null
  status: JobStatus
  latitude: number | null
  longitude: number | null
  address: string | null
  created_at: string
  updated_at: string
  // Joined fields
  factory?: FactoryProfile
  _distance_km?: number
  _match_score?: number
  _applications_count?: number
}

export interface Application {
  id: string
  job_id: string
  worker_id: string
  status: ApplicationStatus
  note: string | null
  applied_at: string
  updated_at: string
  // Joined
  job?: Job
  worker?: WorkerProfile
}

export interface SubscriptionPlan {
  id: string
  name: string
  slug: string
  price_monthly: number
  price_yearly: number
  max_job_posts: number
  max_view_profiles: number
  radius_km: number
  features: Record<string, boolean>
  is_active: boolean
  sort_order: number
}

export interface Subscription {
  id: string
  factory_id: string
  plan_id: string
  status: SubscriptionStatus
  start_date: string
  end_date: string
  trial_ends_at: string | null
  created_at: string
  updated_at: string
  plan?: SubscriptionPlan
}

export interface Payment {
  id: string
  subscription_id: string
  factory_id: string
  amount: number
  method: string
  transaction_id: string | null
  status: PaymentStatus
  vnpay_data: Record<string, string> | null
  created_at: string
}

export interface Review {
  id: string
  from_user_id: string
  to_user_id: string
  job_id: string | null
  rating: number
  comment: string | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  data: Record<string, unknown> | null
  is_read: boolean
  created_at: string
}

// ==================== API Types ====================
export interface NearbyJobsQuery {
  latitude: number
  longitude: number
  radius_km?: number
  industry?: string
  salary_min?: number
  shift_type?: ShiftType
  page?: number
  limit?: number
}

export interface NearbyWorkersQuery {
  latitude: number
  longitude: number
  radius_km?: number
  skills?: string[]
  availability?: Availability
  page?: number
  limit?: number
}

export interface MatchScore {
  distance_score: number
  skills_score: number
  availability_score: number
  rating_score: number
  total: number
}

// ==================== Chat/Messaging Types ====================
export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  receiver_id: string
  content: string
  is_read: boolean
  created_at: string
}

export interface ConversationWithDetails {
  conversation_id: string
  other_user_id: string
  other_user_role: UserRole
  other_user_name: string
  other_user_avatar: string | null
  last_message_content: string | null
  last_message_sender_id: string | null
  last_message_at: string | null
  unread_count: number
}
