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
  location: string | null
  applied_at: string | null
  created_at: string
  follow_up_count: number
  last_follow_up_at: string | null
}

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  saved: 'Saved',
  applied: 'Applied',
  interview: 'Interview',
  rejected: 'Rejected',
  offer: 'Offer',
}

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  saved: 'bg-slate-800/60 text-slate-300 border border-slate-700/40',
  applied: 'bg-blue-950/60 text-blue-300 border border-blue-800/40',
  interview: 'bg-amber-950/60 text-amber-300 border border-amber-800/40',
  rejected: 'bg-red-950/60 text-red-300 border border-red-800/40',
  offer: 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40',
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

export interface ImportedJobData {
  company: string
  role: string
  description: string
  location: string | null
  apply_link: string | null
  notes: string | null
}
