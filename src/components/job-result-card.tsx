'use client'

import { useState } from 'react'
import { JSearchJob, ScoredJob } from '@/types'
import { Button } from '@/components/ui/button'

interface JobResultCardProps {
  scoredJob: ScoredJob
  onAdd: (job: JSearchJob) => Promise<void>
  isAdded: boolean
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 70
      ? 'bg-green-100 text-green-700'
      : score >= 40
      ? 'bg-yellow-100 text-yellow-700'
      : 'bg-red-100 text-red-700'

  return (
    <span className={`text-xs font-bold px-2 py-1 rounded-full ${color}`}>
      {score}% match
    </span>
  )
}

export function JobResultCard({ scoredJob, onAdd, isAdded }: JobResultCardProps) {
  const { job, score, reason } = scoredJob
  const [adding, setAdding] = useState(false)

  async function handleAdd() {
    setAdding(true)
    await onAdd(job)
    setAdding(false)
  }

  const initials = job.employer_name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  const postedDate = job.job_posted_at_datetime_utc
    ? new Date(job.job_posted_at_datetime_utc).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-colors">
      <div className="flex items-start gap-4">
        {/* Company logo / initials */}
        <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {job.employer_logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={job.employer_logo} alt={job.employer_name} className="w-full h-full object-contain" />
          ) : (
            <span className="text-slate-600 font-bold text-sm">{initials}</span>
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm leading-tight">{job.job_title}</h3>
              <p className="text-slate-500 text-sm mt-0.5">{job.employer_name}</p>
            </div>
            <ScoreBadge score={score} />
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            {(job.job_city || job.job_country) && (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {[job.job_city, job.job_country].filter(Boolean).join(', ')}
              </span>
            )}
            {job.job_employment_type && (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {job.job_employment_type}
              </span>
            )}
            {postedDate && (
              <span className="text-xs text-slate-400">{postedDate}</span>
            )}
          </div>

          {/* AI reason */}
          {reason && (
            <p className="text-xs text-slate-500 mt-2 italic border-l-2 border-slate-200 pl-2">
              {reason}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          asChild
        >
          <a href={job.job_apply_link} target="_blank" rel="noopener noreferrer">
            Apply →
          </a>
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onClick={handleAdd}
          disabled={isAdded || adding}
        >
          {isAdded ? '✓ Added' : adding ? 'Adding...' : '+ Add to Tracker'}
        </Button>
      </div>
    </div>
  )
}
