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
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: isDragging ? 'rgba(124, 92, 252, 0.2)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${isDragging ? 'rgba(124, 92, 252, 0.5)' : 'rgba(124, 92, 252, 0.15)'}`,
        boxShadow: isDragging ? '0 0 30px rgba(124, 92, 252, 0.3)' : '0 2px 8px rgba(0,0,0,0.3)',
      }}
      {...attributes}
      {...listeners}
      className="rounded-xl p-3 cursor-grab active:cursor-grabbing transition-all duration-200 hover:border-violet-500/30"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <Link
            href={`/applications/${application.id}`}
            className="font-semibold text-sm text-white/90 hover:text-violet-300 truncate block transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {application.company}
          </Link>
          <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(200,185,255,0.6)' }}>{application.role}</p>
          {application.location && (
            <p className="text-xs mt-0.5 truncate flex items-center gap-1" style={{ color: 'rgba(200,185,255,0.4)' }}>
              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {application.location}
            </p>
          )}
        </div>
        {showFollowUp && (
          <span
            className="flex-shrink-0 w-2 h-2 rounded-full mt-1 animate-pulse"
            style={{ background: '#fbbf24', boxShadow: '0 0 6px rgba(251, 191, 36, 0.6)' }}
            title="Relance recommandée"
          />
        )}
      </div>

      {application.extracted_skills && (
        <div className="flex flex-wrap gap-1 mt-2">
          {application.extracted_skills.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="text-xs px-1.5 py-0.5 rounded-md font-medium"
              style={{ background: 'rgba(124, 92, 252, 0.15)', color: '#a78bfa', border: '1px solid rgba(124, 92, 252, 0.2)' }}
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-2">
        {application.applied_at ? (
          <p className="text-xs flex items-center gap-1" style={{ color: 'rgba(200,185,255,0.35)' }}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Postulé le {new Date(application.applied_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
          </p>
        ) : (
          <p className="text-xs" style={{ color: 'rgba(200,185,255,0.25)' }}>
            Ajouté le {new Date(application.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
          </p>
        )}
        {(application.follow_up_count ?? 0) > 0 && (
          <span className="text-xs" style={{ color: 'rgba(167, 139, 250, 0.6)' }}>
            {application.follow_up_count} relance{(application.follow_up_count ?? 0) > 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  )
}
