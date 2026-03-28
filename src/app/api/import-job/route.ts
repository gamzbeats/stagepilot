import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractJobFromText } from '@/lib/anthropic'

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<head[\s\S]*?<\/head>/gi, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { url } = body as { url?: string }

  if (!url || !url.startsWith('http')) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  // LinkedIn blocks server-side scraping
  if (url.includes('linkedin.com')) {
    return NextResponse.json(
      { error: 'blocked', message: 'LinkedIn bloque l\'import automatique. Colle la description manuellement.' },
      { status: 422 }
    )
  }

  let html: string
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.5',
      },
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: 'blocked', message: `Ce site a retourné une erreur (${res.status}). Essaie un autre lien ou remplis manuellement.` },
        { status: 422 }
      )
    }

    html = await res.text()
  } catch {
    return NextResponse.json(
      { error: 'blocked', message: 'Impossible d\'accéder à cette page. Essaie un autre lien ou remplis manuellement.' },
      { status: 422 }
    )
  }

  const text = stripHtml(html)

  if (!text || text.length < 50) {
    return NextResponse.json(
      { error: 'blocked', message: 'Page vide ou non lisible. Remplis les champs manuellement.' },
      { status: 422 }
    )
  }

  const data = await extractJobFromText(text)

  return NextResponse.json({ data })
}
