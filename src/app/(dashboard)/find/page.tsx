'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { JSearchJob, ScoredJob } from '@/types'
import { JobResultCard } from '@/components/job-result-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const searchSchema = z.object({
  role: z.string().min(1, 'Role is required'),
  location: z.string().optional(),
  skills: z.string().optional(),
  extra: z.string().optional(),
})

type SearchForm = z.infer<typeof searchSchema>

export default function FindJobsPage() {
  const [results, setResults] = useState<ScoredJob[]>([])
  const [added, setAdded] = useState<Set<string>>(new Set())
  const [searched, setSearched] = useState(false)
  const [cvText, setCvText] = useState('')
  const [cvStatus, setCvStatus] = useState<'idle' | 'parsing' | 'done' | 'error'>('idle')
  const [cvFileName, setCvFileName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SearchForm>({
    resolver: zodResolver(searchSchema),
  })

  async function handleCvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setCvFileName(file.name)
    setCvStatus('parsing')
    setCvText('')

    const formData = new FormData()
    formData.append('cv', file)

    const res = await fetch('/api/parse-cv', { method: 'POST', body: formData })

    if (!res.ok) {
      setCvStatus('error')
      return
    }

    const json = await res.json()
    const profile = json.profile ?? {}

    // Auto-fill skills and extra fields from CV
    if (profile.skills) setValue('skills', profile.skills)
    if (profile.experience || profile.summary) {
      setValue('extra', [profile.summary, profile.experience].filter(Boolean).join(' '))
    }

    setCvText(json.rawText ?? '')
    setCvStatus('done')
  }

  async function onSubmit(data: SearchForm) {
    setResults([])
    setSearched(false)

    const res = await fetch('/api/search-jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, cvText }),
    })

    if (res.ok) {
      const json = await res.json()
      setResults(json.results ?? [])
    }
    setSearched(true)
  }

  async function handleAdd(job: JSearchJob) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('applications').insert({
      user_id: user.id,
      company: job.employer_name,
      role: job.job_title,
      job_description: job.job_description,
      status: 'saved',
      notes: job.job_apply_link ? `Apply at: ${job.job_apply_link}` : null,
    })

    setAdded((prev) => new Set(Array.from(prev).concat(job.job_id)))
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Find Internships</h1>
        <p className="text-slate-500 text-sm mt-1">
          Search across LinkedIn, Indeed, Glassdoor and more — AI ranks results by fit with your profile
        </p>
      </div>

      {/* Search form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">Your profile</CardTitle>
          <CardDescription>Upload your CV or fill in your preferences manually</CardDescription>
        </CardHeader>
        <CardContent>
          {/* CV Upload */}
          <div className="mb-5 p-4 border-2 border-dashed border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt"
              className="hidden"
              onChange={handleCvUpload}
            />
            <div className="flex items-center gap-4">
              <div className="flex-1">
                {cvStatus === 'idle' && (
                  <div>
                    <p className="text-sm font-medium text-slate-700">Upload your CV</p>
                    <p className="text-xs text-slate-500 mt-0.5">PDF or TXT — skills and context will be auto-filled</p>
                  </div>
                )}
                {cvStatus === 'parsing' && (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="text-sm text-slate-600">Extracting your profile with AI...</span>
                  </div>
                )}
                {cvStatus === 'done' && (
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">✓</span>
                    <div>
                      <p className="text-sm font-medium text-green-700">{cvFileName} — analyzed</p>
                      <p className="text-xs text-slate-500">Skills and context auto-filled below</p>
                    </div>
                  </div>
                )}
                {cvStatus === 'error' && (
                  <p className="text-sm text-red-500">Failed to parse CV. Try a different file or fill manually.</p>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={cvStatus === 'parsing'}
              >
                {cvStatus === 'done' ? 'Change CV' : 'Choose file'}
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Job title / Role *</Label>
                <Input
                  id="role"
                  placeholder="e.g. Data Analyst, Software Engineer"
                  {...register('role')}
                />
                {errors.role && (
                  <p className="text-xs text-red-500">{errors.role.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g. Paris, London, Remote"
                  {...register('location')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">
                Your skills
                {cvStatus === 'done' && (
                  <span className="ml-2 text-xs text-green-600 font-normal">✓ extracted from CV</span>
                )}
              </Label>
              <Textarea
                id="skills"
                placeholder="e.g. Python, SQL, Excel, Power BI, Machine Learning..."
                rows={2}
                {...register('skills')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="extra">
                Additional context
                {cvStatus === 'done' && (
                  <span className="ml-2 text-xs text-green-600 font-normal">✓ extracted from CV</span>
                )}
              </Label>
              <Textarea
                id="extra"
                placeholder="e.g. Looking for a 6-month internship, experience in finance sector..."
                rows={2}
                {...register('extra')}
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Searching & scoring with AI...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search Jobs
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {searched && results.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="font-medium">No results found</p>
          <p className="text-sm mt-1">Try different keywords or a broader location</p>
        </div>
      )}

      {results.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-600 font-medium">
              {results.length} internship{results.length > 1 ? 's' : ''} found — sorted by AI match score
            </p>
          </div>
          <div className="space-y-3">
            {results.map((scored) => (
              <JobResultCard
                key={scored.job.job_id}
                scoredJob={scored}
                onAdd={handleAdd}
                isAdded={added.has(scored.job.job_id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
