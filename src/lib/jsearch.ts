import { JSearchJob } from '@/types'

const JSEARCH_URL = 'https://jsearch.p.rapidapi.com/search'

async function fetchJobs(query: string): Promise<JSearchJob[]> {
  const params = new URLSearchParams({
    query,
    page: '1',
    num_pages: '1',
  })

  const response = await fetch(`${JSEARCH_URL}?${params}`, {
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
      'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`JSearch API error ${response.status}: ${text}`)
  }

  const data = await response.json()
  return (data.data ?? []) as JSearchJob[]
}

export async function searchJobs(query: string, location?: string): Promise<JSearchJob[]> {
  // Run two queries in parallel: English "internship" + French "stage"
  // to maximise results especially for French cities like Paris
  const base = location ? `${query} ${location}` : query
  const queries = [`${base} internship`, `${base} stage`]

  const results = await Promise.allSettled(queries.map(fetchJobs))

  // Merge, deduplicate by job_id, keep up to 20
  const seen = new Set<string>()
  const merged: JSearchJob[] = []

  for (const result of results) {
    if (result.status === 'fulfilled') {
      for (const job of result.value) {
        if (!seen.has(job.job_id)) {
          seen.add(job.job_id)
          merged.push(job)
        }
      }
    }
  }

  return merged.slice(0, 20)
}
