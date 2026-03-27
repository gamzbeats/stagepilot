'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Link from 'next/link'
import { Application } from '@/types'

interface ApplicationCardProps {
  application: Application
  showFollowUp?: boolean
}

export function ApplicationCard({ application, showFollowUp }: ApplicationCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: application.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm cursor-grab active:cursor-grabbing hover:border-slate-300 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            href={`/applications/${application.id}`}
            className="font-medium text-slate-900 text-sm hover:text-blue-600 truncate block"
            onClick={(e) => e.stopPropagation()}
          >
            {application.company}
          </Link>
          <p className="text-xs text-slate-500 mt-0.5 truncate">{application.role}</p>
        </div>
        {showFollowUp && (
          <span className="flex-shrink-0 w-2 h-2 bg-yellow-400 rounded-full mt-1" title="Follow-up recommended" />
        )}
      </div>

      {application.extracted_skills && (
        <div className="flex flex-wrap gap-1 mt-2">
          {application.extracted_skills.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-400 mt-2">
        {new Date(application.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })}
      </p>
    </div>
  )
}
