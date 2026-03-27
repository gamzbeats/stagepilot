import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { searchJobs } from '@/lib/jsearch'
import { scoreJobMatches } from '@/lib/anthropic'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { role, location, skills, extra, cvText } = body

  if (!role) {
    return NextResponse.json({ error: 'Role is required' }, { status: 400 })
  }

  // 1. Fetch jobs from JSearch
  const jobs = await searchJobs(role, location)

  if (jobs.length === 0) {
    return NextResponse.json({ results: [] })
  }

  // 2. Score all jobs in one AI call (with CV context if provided)
  const scores = await scoreJobMatches(
    { role, skills: skills ?? '', location: location ?? '', extra: extra ?? '', cvText: cvText ?? '' },
    jobs
  )

  // 3. Merge and sort by score descending
  const results = jobs
    .map((job, i) => ({
      job,
      score: scores[i]?.score ?? 50,
      reason: scores[i]?.reason ?? '',
    }))
    .sort((a, b) => b.score - a.score)

  return NextResponse.json({ results })
}
