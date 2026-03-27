import Anthropic from '@anthropic-ai/sdk'
import { ExtractedSkills } from '@/types'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function analyzeJobDescription(jobDescription: string): Promise<ExtractedSkills> {
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Analyze this job description and return a JSON object with exactly these fields:
- "skills": array of required technical skills (e.g. ["React", "TypeScript", "Node.js"])
- "keywords": array of important keywords from the description (e.g. ["startup", "remote", "agile"])
- "seniority": one of "junior", "mid", "senior", or "unknown"

Job description:
${jobDescription}

Return ONLY valid JSON, no markdown, no explanation.`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    return { skills: [], keywords: [], seniority: 'unknown' }
  }

  try {
    const parsed = JSON.parse(content.text)
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
