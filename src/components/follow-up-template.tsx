'use client'

import { useState } from 'react'

interface FollowUpTemplateProps {
  company: string
  role: string
  appliedAt: string | null
}

export function FollowUpTemplate({ company, role, appliedAt }: FollowUpTemplateProps) {
  const [copied, setCopied] = useState(false)

  const date = appliedAt
    ? new Date(appliedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'récemment'

  const template = `Objet : Relance — candidature ${role} chez ${company}

Bonjour,

Je me permets de vous recontacter suite à ma candidature pour le poste de ${role} au sein de ${company}, envoyée le ${date}.

Je reste très intéressé(e) par cette opportunité et souhaitais savoir si vous aviez eu l'occasion de l'examiner.

Je suis disponible pour un entretien selon vos disponibilités, et reste à votre disposition pour tout complément d'information.

Dans l'attente de votre retour, je vous adresse mes cordiales salutations.`

  async function handleCopy() {
    await navigator.clipboard.writeText(template)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mt-3 rounded-xl overflow-hidden" style={{
      background: 'rgba(124, 92, 252, 0.06)',
      border: '1px solid rgba(124, 92, 252, 0.2)',
    }}>
      <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid rgba(124, 92, 252, 0.15)' }}>
        <span className="text-xs font-medium text-violet-300">Template email de relance</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg font-medium transition-all"
          style={{
            background: copied ? 'rgba(52, 211, 153, 0.15)' : 'rgba(124, 92, 252, 0.2)',
            color: copied ? '#6ee7b7' : '#a78bfa',
            border: `1px solid ${copied ? 'rgba(52, 211, 153, 0.3)' : 'rgba(124, 92, 252, 0.3)'}`,
          }}
        >
          {copied ? (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copié !
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copier
            </>
          )}
        </button>
      </div>
      <pre className="px-4 py-3 text-xs whitespace-pre-wrap font-sans leading-relaxed" style={{ color: 'rgba(200,185,255,0.7)' }}>
        {template}
      </pre>
    </div>
  )
}
