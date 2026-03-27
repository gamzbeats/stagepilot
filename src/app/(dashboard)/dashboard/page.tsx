import { createClient } from '@/lib/supabase/server'
import { Application } from '@/types'
import { ApplicationTable } from '@/components/application-table'
import { ApplicationForm } from '@/components/application-form'
import { FollowUpAlert } from '@/components/follow-up-alert'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: applications } = await supabase
    .from('applications')
    .select('*')
    .order('created_at', { ascending: false })

  const apps: Application[] = applications ?? []

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">
            {apps.length} application{apps.length !== 1 ? 's' : ''} tracked
          </p>
        </div>
        <ApplicationForm />
      </div>

      <FollowUpAlert applications={apps} />

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <ApplicationTable applications={apps} />
      </div>
    </div>
  )
}
