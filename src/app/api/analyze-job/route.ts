import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeJobDescription } from '@/lib/anthropic'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { applicationId, jobDescription } = body

  if (!applicationId || !jobDescription) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Verify ownership
  const { data: app } = await supabase
    .from('applications')
    .select('id')
    .eq('id', applicationId)
    .eq('user_id', user.id)
    .single()

  if (!app) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  }

  const extractedSkills = await analyzeJobDescription(jobDescription)

  await supabase
    .from('applications')
    .update({ extracted_skills: extractedSkills })
    .eq('id', applicationId)

  return NextResponse.json({ extractedSkills })
}
