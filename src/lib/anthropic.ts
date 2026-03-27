import OpenAI from 'openai'
import { ExtractedSkills } from '@/types'

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
