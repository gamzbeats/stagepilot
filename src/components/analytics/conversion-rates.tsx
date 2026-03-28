'use client'

import { Application } from '@/types'

interface ConversionRatesProps {
  apps: Application[]
}

export function ConversionRates({ apps }: ConversionRatesProps) {
  const applied = apps.filter((a) => ['applied', 'interview', 'offer', 'rejected'].includes(a.status)).length
  const interview = apps.filter((a) => ['interview', 'offer'].includes(a.status)).length
  const offer = apps.filter((a) => a.status === 'offer').length
  const total = apps.length

  const rates = [
    {
      label: 'Taux de réponse',
      sublabel: 'Candidatures → Entretiens',
      value: applied > 0 ? Math.round((interview / applied) * 100) : 0,
      color: '#93c5fd',
      bg: 'rgba(59, 130, 246, 0.08)',
      border: 'rgba(59, 130, 246, 0.2)',
      bar: 'rgba(147, 197, 253, 0.7)',
    },
    {
      label: 'Taux de conversion',
      sublabel: 'Entretiens → Offres',
      value: interview > 0 ? Math.round((offer / interview) * 100) : 0,
      color: '#fcd34d',
      bg: 'rgba(245, 158, 11, 0.08)',
      border: 'rgba(245, 158, 11, 0.2)',
      bar: 'rgba(252, 211, 77, 0.7)',
    },
    {
      label: 'Taux de succès global',
      sublabel: 'Total → Offres',
      value: total > 0 ? Math.round((offer / total) * 100) : 0,
      color: '#6ee7b7',
      bg: 'rgba(52, 211, 153, 0.08)',
      border: 'rgba(52, 211, 153, 0.2)',
      bar: 'rgba(110, 231, 183, 0.7)',
    },
  ]

  return (
    <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(124, 92, 252, 0.15)' }}>
      <h3 className="text-sm font-semibold text-white/80 mb-5">Taux de conversion</h3>
      <div className="space-y-5">
        {rates.map(({ label, sublabel, value, color, bg, border, bar }) => (
          <div key={label}>
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <p className="text-sm font-medium text-white/80">{label}</p>
                <p className="text-xs" style={{ color: 'rgba(200,185,255,0.4)' }}>{sublabel}</p>
              </div>
              <span className="text-2xl font-bold" style={{ color }}>{value}%</span>
            </div>
            <div className="rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', height: '8px' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${value}%`, background: bar, minWidth: value > 0 ? '4px' : '0' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
