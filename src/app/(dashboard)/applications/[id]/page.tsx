'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Application, ApplicationStatus, STATUS_LABELS, STATUS_COLORS } from '@/types'
import { SkillsBadges } from '@/components/skills-badges'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'

const statuses: ApplicationStatus[] = ['saved', 'applied', 'interview', 'rejected', 'offer']

export default function ApplicationDetailPage() {
  const params = useParams()
  const supabase = createClient()

  const [app, setApp] = useState<Application | null>(null)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('applications')
        .select('*')
        .eq('id', params.id as string)
        .single()
      if (data) {
        setApp(data as Application)
        setNotes(data.notes || '')
      }
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  async function updateStatus(status: ApplicationStatus) {
    if (!app) return
    await supabase.from('applications').update({ status }).eq('id', app.id)
    setApp({ ...app, status })
  }

  async function saveNotes() {
    if (!app) return
    setSaving(true)
    await supabase.from('applications').update({ notes }).eq('id', app.id)
    setSaving(false)
    setApp({ ...app, notes })
  }

  async function runAnalysis() {
    if (!app?.job_description) return
    setAnalyzing(true)
    try {
      const res = await fetch('/api/analyze-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: app.id,
          jobDescription: app.job_description,
        }),
      })
      const { extractedSkills } = await res.json()
      setApp({ ...app, extracted_skills: extractedSkills })
    } finally {
      setAnalyzing(false)
    }
  }

  if (!app) {
    return (
      <div className="p-8 flex items-center justify-center min-h-64">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">{app.company}</h1>
        <p className="text-slate-500 mt-1">{app.role}</p>
      </div>

      <div className="space-y-4">
        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={app.status} onValueChange={(v) => updateStatus(v as ApplicationStatus)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[s]}`}>
                      {STATUS_LABELS[s]}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* AI Analysis */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">AI Analysis</CardTitle>
            {app.job_description && (
              <Button
                size="sm"
                variant="outline"
                onClick={runAnalysis}
                disabled={analyzing}
              >
                {analyzing ? 'Analyzing...' : app.extracted_skills ? 'Re-analyze' : 'Analyze'}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {app.extracted_skills ? (
              <SkillsBadges data={app.extracted_skills} />
            ) : (
              <p className="text-sm text-slate-500">
                {app.job_description
                  ? 'Click "Analyze" to extract skills and keywords with AI.'
                  : 'No job description provided.'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your notes here..."
              rows={4}
            />
            <Button size="sm" onClick={saveNotes} disabled={saving}>
              {saving ? 'Saving...' : 'Save notes'}
            </Button>
          </CardContent>
        </Card>

        {/* Job Description */}
        {app.job_description && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{app.job_description}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
