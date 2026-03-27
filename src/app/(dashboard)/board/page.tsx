import { createClient } from '@/lib/supabase/server'
import { Application } from '@/types'
import { KanbanBoard } from '@/components/kanban-board'
import { ApplicationForm } from '@/components/application-form'

export default async function BoardPage() {
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
          <h1 className="text-2xl font-bold text-slate-900">Kanban Board</h1>
          <p className="text-slate-500 text-sm mt-1">Drag cards to update their status</p>
        </div>
        <ApplicationForm />
      </div>

      <KanbanBoard initialApplications={apps} />
    </div>
  )
}
