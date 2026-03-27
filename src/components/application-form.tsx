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
  company: z.string().min(1, 'Company is required'),
  role: z.string().min(1, 'Role is required'),
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
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
  })

  async function onSubmit(data: ApplicationFormData) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Insert application
    const { data: app, error } = await supabase
      .from('applications')
      .insert({
        user_id: user.id,
        company: data.company,
        role: data.role,
        job_description: data.job_description || null,
        notes: data.notes || null,
        status: 'saved',
      })
      .select()
      .single()

    if (error || !app) return

    // Trigger AI analysis if job description provided
    if (data.job_description?.trim()) {
      setIsAnalyzing(true)
      try {
        await fetch('/api/analyze-job', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            applicationId: app.id,
            jobDescription: data.job_description,
          }),
        })
      } catch {
        // Non-blocking — app was created successfully
      } finally {
        setIsAnalyzing(false)
      }
    }

    reset()
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add application
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add application</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Input id="company" placeholder="Google" {...register('company')} />
              {errors.company && (
                <p className="text-xs text-red-500">{errors.company.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Input id="role" placeholder="Software Engineer Intern" {...register('role')} />
              {errors.role && (
                <p className="text-xs text-red-500">{errors.role.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="job_description">
              Job description{' '}
              <span className="text-slate-400 font-normal text-xs">(AI will analyze it)</span>
            </Label>
            <Textarea
              id="job_description"
              placeholder="Paste the job description here..."
              rows={5}
              {...register('job_description')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Contact info, referral, etc."
              rows={2}
              {...register('notes')}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isAnalyzing}>
              {isAnalyzing ? 'Analyzing with AI...' : isSubmitting ? 'Saving...' : 'Save application'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
