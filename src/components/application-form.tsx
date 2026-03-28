'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

const applicationSchema = z.object({
  company: z.string().min(1, 'Entreprise requise'),
  role: z.string().min(1, 'Poste requis'),
  location: z.string().optional(),
  job_description: z.string().optional(),
  notes: z.string().optional(),
})

type ApplicationFormData = z.infer<typeof applicationSchema>

interface ApplicationFormProps {
  trigger?: React.ReactNode
}

export function ApplicationForm({ trigger }: ApplicationFormProps) {
  const [open, setOpen] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [mode, setMode] = useState<'manual' | 'url'>('manual')
  const [importUrl, setImportUrl] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationFormData>({ resolver: zodResolver(applicationSchema) })

  async function handleImport() {
    if (!importUrl.trim()) return
    setIsImporting(true)
    setImportError(null)

    const res = await fetch('/api/import-job', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: importUrl }),
    })

    const json = await res.json()

    if (!res.ok) {
      setImportError(json.message ?? 'Import échoué. Remplis les champs manuellement.')
      setIsImporting(false)
      return
    }

    const data = json.data
    if (data.company) setValue('company', data.company)
    if (data.role) setValue('role', data.role)
    if (data.location) setValue('location', data.location)
    setValue('job_description', data.description ?? '')
    if (data.notes) setValue('notes', data.notes)

    setMode('manual')
    setIsImporting(false)

    if (!data.company && !data.role) {
      setImportError('Page partiellement importée — vérifie et complète les champs.')
    }
  }

  async function onSubmit(data: ApplicationFormData) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: app, error } = await supabase
      .from('applications')
      .insert({
        user_id: user.id,
        company: data.company,
        role: data.role,
        location: data.location || null,
        job_description: data.job_description || null,
        notes: data.notes || null,
        status: 'saved',
      })
      .select()
      .single()

    if (error || !app) return

    if (data.job_description?.trim()) {
      setIsAnalyzing(true)
      try {
        await fetch('/api/analyze-job', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ applicationId: app.id, jobDescription: data.job_description }),
        })
      } catch {
        // Non-blocking
      } finally {
        setIsAnalyzing(false)
      }
    }

    reset()
    setImportUrl('')
    setMode('manual')
    setOpen(false)
    router.refresh()
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(124, 92, 252, 0.2)',
    color: '#f0edff',
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setMode('manual'); setImportError(null); setImportUrl('') } }}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            className="font-semibold text-white border-0 rounded-xl"
            style={{ background: 'linear-gradient(135deg, #7c5cfc, #a855f7)', boxShadow: '0 4px 20px rgba(124, 92, 252, 0.35)' }}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg rounded-2xl" style={{ background: '#0d0429', border: '1px solid rgba(124, 92, 252, 0.25)' }}>
        <DialogHeader>
          <DialogTitle className="text-white">Ajouter une candidature</DialogTitle>
        </DialogHeader>

        {/* Mode toggle */}
        <div className="flex gap-1 p-1 rounded-xl mt-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(124, 92, 252, 0.15)' }}>
          <button
            type="button"
            onClick={() => { setMode('manual'); setImportError(null) }}
            className="flex-1 py-1.5 text-xs font-medium rounded-lg transition-all"
            style={mode === 'manual' ? {
              background: 'linear-gradient(135deg, rgba(124, 92, 252, 0.4), rgba(168, 85, 247, 0.3))',
              color: '#c4b5fd',
              border: '1px solid rgba(124, 92, 252, 0.3)',
            } : { color: 'rgba(200,185,255,0.4)' }}
          >
            ✏️ Remplir manuellement
          </button>
          <button
            type="button"
            onClick={() => { setMode('url'); setImportError(null) }}
            className="flex-1 py-1.5 text-xs font-medium rounded-lg transition-all"
            style={mode === 'url' ? {
              background: 'linear-gradient(135deg, rgba(124, 92, 252, 0.4), rgba(168, 85, 247, 0.3))',
              color: '#c4b5fd',
              border: '1px solid rgba(124, 92, 252, 0.3)',
            } : { color: 'rgba(200,185,255,0.4)' }}
          >
            🔗 Importer depuis URL
          </button>
        </div>

        {mode === 'url' && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-purple-200/70 text-sm">URL de l&apos;offre</Label>
              <Input
                placeholder="https://www.welcometothejungle.com/..."
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                style={inputStyle}
                className="h-10"
              />
              <p className="text-xs" style={{ color: 'rgba(200,185,255,0.4)' }}>
                Fonctionne avec Indeed, Welcome to the Jungle, WTTJ, Glassdoor...
              </p>
            </div>
            {importError && (
              <div className="px-4 py-3 rounded-xl text-xs" style={{ background: 'rgba(251, 191, 36, 0.08)', border: '1px solid rgba(251, 191, 36, 0.2)', color: '#fbbf24' }}>
                {importError}
              </div>
            )}
            <Button
              type="button"
              onClick={handleImport}
              disabled={isImporting || !importUrl.trim()}
              className="w-full font-semibold text-white border-0 rounded-xl"
              style={{ background: 'linear-gradient(135deg, #7c5cfc, #a855f7)' }}
            >
              {isImporting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Import en cours...
                </span>
              ) : 'Importer avec IA'}
            </Button>
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          style={{ display: mode === 'manual' ? 'block' : 'none' }}
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-purple-200/70 text-sm">Entreprise *</Label>
              <Input placeholder="Google" {...register('company')} style={inputStyle} className="h-10" />
              {errors.company && <p className="text-xs text-red-400">{errors.company.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-purple-200/70 text-sm">Poste *</Label>
              <Input placeholder="Stagiaire Data Analyst" {...register('role')} style={inputStyle} className="h-10" />
              {errors.role && <p className="text-xs text-red-400">{errors.role.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-purple-200/70 text-sm">Lieu</Label>
            <Input placeholder="Paris, Lyon, Remote..." {...register('location')} style={inputStyle} className="h-10" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-purple-200/70 text-sm">
              Description du poste{' '}
              <span className="text-violet-400/60 font-normal">(l&apos;IA analysera les compétences)</span>
            </Label>
            <Textarea
              placeholder="Colle la description du poste ici..."
              rows={4}
              {...register('job_description')}
              style={inputStyle}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-purple-200/70 text-sm">Notes</Label>
            <Textarea
              placeholder="Contact, référence, informations utiles..."
              rows={2}
              {...register('notes')}
              style={inputStyle}
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" className="text-purple-200/50 hover:text-purple-200" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isAnalyzing}
              className="font-semibold text-white border-0 rounded-xl"
              style={{ background: 'linear-gradient(135deg, #7c5cfc, #a855f7)', boxShadow: '0 4px 15px rgba(124, 92, 252, 0.3)' }}
            >
              {isAnalyzing ? 'Analyse IA...' : isSubmitting ? 'Enregistrement...' : 'Sauvegarder'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
