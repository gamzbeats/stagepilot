'use client'

import { Application } from '@/types'

interface TopSkillsProps {
  apps: Application[]
}

export function TopSkills({ apps }: TopSkillsProps) {
  const skillMap = new Map<string, number>()

  for (const app of apps) {
    if (!app.extracted_skills) continue
    for (const skill of app.extracted_skills.skills) {
      const key = skill.toLowerCase().trim()
      if (key) skillMap.set(key, (skillMap.get(key) ?? 0) + 1)
    }
  }

  const topSkills = Array.from(skillMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([skill, count]) => ({ skill: skill.charAt(0).toUpperCase() + skill.slice(1), count }))

  const maxCount = topSkills[0]?.count ?? 1

  return (
    <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(124, 92, 252, 0.15)' }}>
      <h3 className="text-sm font-semibold text-white/80 mb-5">Compétences les plus demandées</h3>

      {topSkills.length === 0 ? (
        <p className="text-sm" style={{ color: 'rgba(200,185,255,0.4)' }}>
          Analyse des offres pour voir les compétences requises apparaître ici.
        </p>
      ) : (
        <div className="space-y-2.5">
          {topSkills.map(({ skill, count }, i) => {
            const pct = (count / maxCount) * 100
            const opacity = 0.9 - i * 0.06
            return (
              <div key={skill} className="flex items-center gap-3">
                <span className="text-xs font-medium w-24 flex-shrink-0 truncate" style={{ color: `rgba(167, 139, 250, ${opacity})` }}>
                  {skill}
                </span>
                <div className="flex-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', height: '8px' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, rgba(124, 92, 252, ${opacity * 0.9}), rgba(168, 85, 247, ${opacity * 0.7}))`,
                    }}
                  />
                </div>
                <span className="text-xs font-bold w-4 text-right" style={{ color: `rgba(167, 139, 250, ${opacity})` }}>
                  {count}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
