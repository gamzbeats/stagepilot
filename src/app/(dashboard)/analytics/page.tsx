import { createClient } from '@/lib/supabase/server'
import { Application } from '@/types'
import { StatsOverview } from '@/components/analytics/stats-overview'
import { StatusFunnel } from '@/components/analytics/status-funnel'
import { WeeklyChart } from '@/components/analytics/weekly-chart'
import { ConversionRates } from '@/components/analytics/conversion-rates'
import { TopSkills } from '@/components/analytics/top-skills'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: applications } = await supabase
    .from('applications')
    .select('*')
    .order('created_at', { ascending: false })

  const apps: Application[] = applications ?? []

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(200,185,255,0.5)' }}>
          Insights personnalisés sur tes candidatures
        </p>
      </div>

      {apps.length === 0 ? (
        <div className="text-center py-20 rounded-2xl" style={{ border: '1px dashed rgba(124, 92, 252, 0.2)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(124, 92, 252, 0.08)', border: '1px solid rgba(124, 92, 252, 0.2)' }}>
            <svg className="w-7 h-7" style={{ color: 'rgba(167, 139, 250, 0.5)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="font-semibold text-white/60">Pas encore de données</p>
          <p className="text-sm mt-1" style={{ color: 'rgba(200,185,255,0.35)' }}>
            Ajoute des candidatures pour voir tes statistiques apparaître ici
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPI row */}
          <StatsOverview apps={apps} />

          {/* Charts row 1 */}
          <div className="grid grid-cols-2 gap-6">
            <StatusFunnel apps={apps} />
            <ConversionRates apps={apps} />
          </div>

          {/* Charts row 2 */}
          <WeeklyChart apps={apps} />

          {/* Top skills */}
          <TopSkills apps={apps} />
        </div>
      )}
    </div>
  )
}
