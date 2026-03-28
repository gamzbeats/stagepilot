import OpenAI from 'openai'
import { ExtractedSkills, ImportedJobData, JSearchJob } from '@/types'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function analyzeJobDescription(jobDescription: string): Promise<ExtractedSkills> {
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 1024,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: 'You are a job description analyzer. Always respond with valid JSON only.',
      },
      {
        role: 'user',
        content: `Analyze this job description and return a JSON object with exactly these fields:
- "skills": array of required technical skills (e.g. ["React", "TypeScript", "Node.js"])
- "keywords": array of important keywords from the description (e.g. ["startup", "remote", "agile"])
- "seniority": one of "junior", "mid", "senior", or "unknown"

Job description:
${jobDescription}`,
      },
    ],
  })

  const text = response.choices[0]?.message?.content ?? ''

  try {
    const parsed = JSON.parse(text)
    return {
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      seniority: ['junior', 'mid', 'senior'].includes(parsed.seniority)
        ? parsed.seniority
        : 'unknown',
    }
  } catch {
    return { skills: [], keywords: [], seniority: 'unknown' }
  }
}

export interface UserProfile {
  role: string
  skills: string
  location: string
  extra: string
  cvText?: string
}

export async function scoreJobMatches(
  profile: UserProfile,
  jobs: JSearchJob[]
): Promise<Array<{ score: number; reason: string }>> {
  const jobList = jobs
    .map((j, i) => {
      const desc = j.job_description?.slice(0, 300) ?? ''
      return `[${i}] ${j.job_title} at ${j.employer_name} (${j.job_city ?? ''}, ${j.job_country ?? ''})
Description: ${desc}`
    })
    .join('\n\n')

  const cvContext = profile.cvText
    ? `\nCV extract:\n${profile.cvText.slice(0, 1500)}`
    : ''

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 1500,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: 'You are a job matching assistant. Always respond with valid JSON only.',
      },
      {
        role: 'user',
        content: `Student profile:
- Looking for: ${profile.role}
- Skills: ${profile.skills}
- Location preference: ${profile.location}
- Additional context: ${profile.extra}${cvContext}

Rate each of the following ${jobs.length} job listings for this student (0-100 match score).
Return a JSON object with a "results" array of exactly ${jobs.length} items in the same order:
{ "results": [{ "score": 85, "reason": "Strong React match, location fits" }, ...] }

Job listings:
${jobList}`,
      },
    ],
  })

  const text = response.choices[0]?.message?.content ?? ''

  try {
    const parsed = JSON.parse(text)
    const results = parsed.results
    if (Array.isArray(results) && results.length === jobs.length) {
      return results.map((r: { score?: number; reason?: string }) => ({
        score: typeof r.score === 'number' ? Math.min(100, Math.max(0, r.score)) : 50,
        reason: typeof r.reason === 'string' ? r.reason : '',
      }))
    }
  } catch {
    // fallback
  }

  return jobs.map(() => ({ score: 50, reason: '' }))
}

export async function extractJobFromText(text: string): Promise<ImportedJobData> {
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 1500,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: 'You are a job posting parser. Extract structured job data from the provided text and return JSON only.',
      },
      {
        role: 'user',
        content: `Extract from this job posting page text:
- "company": the company/employer name
- "role": the job title/position
- "description": the full job description text (max 2000 chars)
- "location": city/country or "Remote" if mentioned, null if not found
- "apply_link": the application URL if present, null otherwise
- "notes": a short summary (2-4 lines) of the most useful practical details for a candidate: salary/compensation if mentioned, internship duration if mentioned, start date if mentioned, remote/hybrid/on-site work mode, any other key info. Write in French. Return null if nothing relevant is found.

Page text:
${text.slice(0, 8000)}`,
      },
    ],
  })

  const raw = response.choices[0]?.message?.content ?? '{}'
  try {
    const parsed = JSON.parse(raw)
    return {
      company: typeof parsed.company === 'string' ? parsed.company : '',
      role: typeof parsed.role === 'string' ? parsed.role : '',
      description: typeof parsed.description === 'string' ? parsed.description.slice(0, 2000) : '',
      location: typeof parsed.location === 'string' ? parsed.location : null,
      apply_link: typeof parsed.apply_link === 'string' ? parsed.apply_link : null,
      notes: typeof parsed.notes === 'string' ? parsed.notes : null,
    }
  } catch {
    return { company: '', role: '', description: text.slice(0, 500), location: null, apply_link: null, notes: null }
  }
}
