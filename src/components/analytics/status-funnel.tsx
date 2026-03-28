'use client'

import { Application, ApplicationStatus, STATUS_LABELS } from '@/types'

interface StatusFunnelProps {
  apps: Application[]
}

const STATUS_ORDER: ApplicationStatus[] = ['saved', 'applied', 'interview', 'offer', 'rejected']

const STATUS_CHART_COLORS: Record<ApplicationStatus, { bar: string; text: string }> = {
  saved: { bar: 'rgba(148, 163, 184, 0.5)', text: '#94a3b8' },
  applied: { bar: 'rgba(147, 197, 253, 0.6)', text: '#93c5fd' },
  interview: { bar: 'rgba(252, 211, 77, 0.6)', text: '#fcd34d' },
  offer: { bar: 'rgba(110, 231, 183, 0.7)', text: '#6ee7b7' },
  rejected: { bar: 'rgba(252, 165, 165, 0.4)', text: '#fca5a5' },
}

export function StatusFunnel({ apps }: StatusFunnelProps) {
  const counts = STATUS_ORDER.map((s) => ({
    status: s,
    count: apps.filter((a) => a.status === s).length,
  }))
  const maxCount = Math.max(...counts.map((c) => c.count), 1)

  return (
    <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(124, 92, 252, 0.15)' }}>
      <h3 className="text-sm font-semibold text-white/80 mb-5">Répartition par statut</h3>
      <div className="space-y-3">
        {counts.map(({ status, count }) => {
          const pct = (count / maxCount) * 100
          const colors = STATUS_CHART_COLORS[status]
          return (
            <div key={status} className="flex items-center gap-3">
              <span className="text-xs font-medium w-20 flex-shrink-0" style={{ color: colors.text }}>
                {STATUS_LABELS[status]}
              </span>
              <div className="flex-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', height: '10px' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: colors.bar, minWidth: count > 0 ? '4px' : '0' }}
                />
              </div>
              <span className="text-xs font-bold w-6 text-right" style={{ color: colors.text }}>{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
