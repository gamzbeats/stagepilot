import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('cv') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  // Extract raw text from PDF using pdf-parse
  const buffer = Buffer.from(await file.arrayBuffer())
  let rawText = ''

  try {
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      // Use lib path directly to bypass pdf-parse test file loading issue in Next.js
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse/lib/pdf-parse.js')
      const parsed = await pdfParse(buffer)
      rawText = parsed.text
    } else {
      rawText = buffer.toString('utf-8')
    }
  } catch (err) {
    console.error('PDF parse error:', err)
    return NextResponse.json({ error: 'Failed to parse CV file' }, { status: 422 })
  }

  if (!rawText.trim()) {
    return NextResponse.json({ error: 'Could not extract text from file' }, { status: 422 })
  }

  // Use GPT to extract structured profile from raw CV text
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 1024,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: 'You are a CV parser. Extract structured information from the CV text and return JSON only.',
      },
      {
        role: 'user',
        content: `Extract from this CV:
- "skills": comma-separated list of technical and soft skills
- "experience": short summary of experience level and main domains (1-2 sentences)
- "education": current degree/school
- "languages": programming languages or spoken languages detected
- "summary": 2-sentence professional summary

CV text:
${rawText.slice(0, 4000)}`,
      },
    ],
  })

  const text = response.choices[0]?.message?.content ?? '{}'
  let profile: Record<string, string> = {}
  try {
    profile = JSON.parse(text)
  } catch {
    profile = { skills: '', experience: '', education: '', languages: '', summary: '' }
  }

  return NextResponse.json({ profile, rawText: rawText.slice(0, 3000) })
}
