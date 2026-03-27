export type ApplicationStatus = 'saved' | 'applied' | 'interview' | 'rejected' | 'offer'

export interface ExtractedSkills {
  skills: string[]
  keywords: string[]
  seniority: 'junior' | 'mid' | 'senior' | 'unknown'
}

export interface Application {
  id: string
  user_id: string
  company: string
  role: string
  status: ApplicationStatus
  job_description: string | null
  extracted_skills: ExtractedSkills | null
  notes: string | null
  applied_at: string | null
  created_at: string
}

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  saved: 'Saved',
  applied: 'Applied',
  interview: 'Interview',
  rejected: 'Rejected',
  offer: 'Offer',
}

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  saved: 'bg-slate-100 text-slate-700',
  applied: 'bg-blue-100 text-blue-700',
  interview: 'bg-yellow-100 text-yellow-700',
  rejected: 'bg-red-100 text-red-700',
  offer: 'bg-green-100 text-green-700',
}

// JSearch types
export interface JSearchJob {
  job_id: string
  job_title: string
  employer_name: string
  employer_logo: string | null
  job_city: string | null
  job_country: string | null
  job_employment_type: string | null
  job_apply_link: string
  job_description: string
  job_posted_at_datetime_utc: string | null
  job_min_salary: number | null
  job_max_salary: number | null
  job_salary_currency: string | null
}

export interface ScoredJob {
  job: JSearchJob
  score: number
  reason: string
}
