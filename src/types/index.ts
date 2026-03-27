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
