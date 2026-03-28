import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { applicationId } = body as { applicationId?: string }

  if (!applicationId) {
    return NextResponse.json({ error: 'applicationId required' }, { status: 400 })
  }

  // Verify ownership and get current count
  const { data: app } = await supabase
    .from('applications')
    .select('id, follow_up_count')
    .eq('id', applicationId)
    .eq('user_id', user.id)
    .single()

  if (!app) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const newCount = (app.follow_up_count ?? 0) + 1
  const now = new Date().toISOString()

  const { error } = await supabase
    .from('applications')
    .update({ follow_up_count: newCount, last_follow_up_at: now })
    .eq('id', applicationId)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ follow_up_count: newCount, last_follow_up_at: now })
}
