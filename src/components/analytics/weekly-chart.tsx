'use client'

import { Application } from '@/types'

interface WeeklyChartProps {
  apps: Application[]
}

export function WeeklyChart({ apps }: WeeklyChartProps) {
  // Build 8 week buckets (7-day windows ending today)
  const now = Date.now()
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const end = now - i * 7 * 24 * 60 * 60 * 1000
    const start = end - 7 * 24 * 60 * 60 * 1000
    const date = new Date(start)
    const label = date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })
    const count = apps.filter((a) => {
      const t = new Date(a.created_at).getTime()
      return t >= start && t < end
    }).length
    return { label, count }
  }).reverse()

  const maxCount = Math.max(...weeks.map((w) => w.count), 1)

  return (
    <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(124, 92, 252, 0.15)' }}>
      <h3 className="text-sm font-semibold text-white/80 mb-5">Candidatures par semaine (8 dernières semaines)</h3>
      <div className="flex items-end gap-2" style={{ height: '120px' }}>
        {weeks.map(({ label, count }, i) => {
          const pct = (count / maxCount) * 100
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-xs font-semibold" style={{ color: count > 0 ? '#a78bfa' : 'rgba(200,185,255,0.3)' }}>
                {count > 0 ? count : ''}
              </span>
              <div className="w-full flex items-end" style={{ height: '80px' }}>
                <div
                  className="w-full rounded-t-lg transition-all duration-700"
                  style={{
                    height: `${Math.max(pct, count > 0 ? 8 : 2)}%`,
                    background: count > 0
                      ? 'linear-gradient(to top, #7c5cfc, #a855f7)'
                      : 'rgba(255,255,255,0.04)',
                    boxShadow: count > 0 ? '0 0 15px rgba(124, 92, 252, 0.25)' : 'none',
                  }}
                />
              </div>
              <span className="text-xs text-center leading-tight" style={{ color: 'rgba(200,185,255,0.35)', fontSize: '10px' }}>
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
