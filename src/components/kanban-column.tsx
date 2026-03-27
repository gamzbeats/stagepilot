'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Application, ApplicationStatus, STATUS_LABELS, STATUS_COLORS } from '@/types'
import { ApplicationCard } from './application-card'

interface KanbanColumnProps {
  status: ApplicationStatus
  applications: Application[]
  followUpIds: Set<string>
}

export function KanbanColumn({ status, applications, followUpIds }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div className="flex flex-col min-w-[260px] max-w-[280px]">
      {/* Column header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[status]}`}>
          {STATUS_LABELS[status]}
        </span>
        <span className="text-xs text-slate-400 font-medium">{applications.length}</span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-xl p-2 space-y-2 min-h-[120px] transition-colors ${
          isOver ? 'bg-blue-50 border-2 border-blue-200 border-dashed' : 'bg-slate-100'
        }`}
      >
        <SortableContext items={applications.map((a) => a.id)} strategy={verticalListSortingStrategy}>
          {applications.map((app) => (
            <ApplicationCard
              key={app.id}
              application={app}
              showFollowUp={followUpIds.has(app.id)}
            />
          ))}
        </SortableContext>

        {applications.length === 0 && (
          <div className="flex items-center justify-center h-20 text-xs text-slate-400">
            Drop here
          </div>
        )}
      </div>
    </div>
  )
}
