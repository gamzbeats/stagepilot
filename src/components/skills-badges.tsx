import { ExtractedSkills } from '@/types'
import { Badge } from '@/components/ui/badge'

interface SkillsBadgesProps {
  data: ExtractedSkills
}

const seniorityConfig = {
  junior: { label: 'Junior', className: 'bg-green-100 text-green-700' },
  mid: { label: 'Mid-level', className: 'bg-blue-100 text-blue-700' },
  senior: { label: 'Senior', className: 'bg-purple-100 text-purple-700' },
  unknown: { label: 'Unknown level', className: 'bg-slate-100 text-slate-700' },
}

export function SkillsBadges({ data }: SkillsBadgesProps) {
  const seniority = seniorityConfig[data.seniority]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-700">Seniority:</span>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${seniority.className}`}
        >
          {seniority.label}
        </span>
      </div>

      {data.skills.length > 0 && (
        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">Required skills</p>
          <div className="flex flex-wrap gap-1.5">
            {data.skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {data.keywords.length > 0 && (
        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">Keywords</p>
          <div className="flex flex-wrap gap-1.5">
            {data.keywords.map((keyword) => (
              <span
                key={keyword}
                className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
