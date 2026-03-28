'use client'

import { Application } from '@/types'

interface StatsOverviewProps {
  apps: Application[]
}

export function StatsOverview({ apps }: StatsOverviewProps) {
  const total = apps.length

  const active = apps.filter((a) => a.status !== 'rejected' && a.status !== 'offer').length

  const firstApp = apps.length > 0
    ? new Date(apps[apps.length - 1].created_at)
    : null
  const weeksElapsed = firstApp
    ? Math.max(1, Math.ceil((Date.now() - firstApp.getTime()) / (7 * 24 * 60 * 60 * 1000)))
    : 1
  const perWeek = total > 0 ? (total / weeksElapsed).toFixed(1) : '0'

  const totalFollowUps = apps.reduce((sum, a) => sum + (a.follow_up_count ?? 0), 0)

  const stats = [
    { label: 'Total candidatures', value: total, color: '#a78bfa', bg: 'rgba(124, 92, 252, 0.1)', border: 'rgba(124, 92, 252, 0.2)', icon: '📋' },
    { label: 'En cours', value: active, color: '#93c5fd', bg: 'rgba(59, 130, 246, 0.08)', border: 'rgba(59, 130, 246, 0.2)', icon: '🚀' },
    { label: 'Par semaine (moy.)', value: perWeek, color: '#fcd34d', bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.2)', icon: '📈' },
    { label: 'Relances envoyées', value: totalFollowUps, color: '#6ee7b7', bg: 'rgba(52, 211, 153, 0.08)', border: 'rgba(52, 211, 153, 0.2)', icon: '✉️' },
  ]

  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map(({ label, value, color, bg, border, icon }) => (
        <div key={label} className="rounded-2xl p-5" style={{ background: bg, border: `1px solid ${border}` }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-3xl font-bold" style={{ color }}>{value}</p>
              <p className="text-xs mt-1.5" style={{ color: 'rgba(200,185,255,0.5)' }}>{label}</p>
            </div>
            <span className="text-xl">{icon}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
