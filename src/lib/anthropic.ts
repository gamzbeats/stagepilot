import OpenAI from 'openai'
import { ExtractedSkills, JSearchJob } from '@/types'

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
